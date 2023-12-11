const express = require('express');
const app = express();
const { Client, GatewayIntentBits } = require('discord.js');
const { WebClient } = require('@slack/web-api');
const { SocketModeClient } = require('@slack/socket-mode');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config({ path: 'src/.env' });

// 環境変数からユーザーIDの配列を読み込み、トリミングを行う
const DISCORD_ALLOWED_USER_IDS = process.env.DISCORD_ALLOWED_USER_IDS 
    ? process.env.DISCORD_ALLOWED_USER_IDS.split(',').map(id => id.trim()) 
    : [];
const SLACK_ALLOWED_USER_IDS = process.env.SLACK_ALLOWED_USER_IDS 
    ? process.env.SLACK_ALLOWED_USER_IDS.split(',').map(id => id.trim()) 
    : [];

const DEBUG = true;
const { DISCORD_TOKEN, DISCORD_CHANNEL, DISCORD_CHANNEL_ID,
        SLACK_BOT_TOKEN, SLACK_APP_TOKEN, SLACK_CHANNEL, SLACK_CHANNEL_ID,
        PORT } = process.env;

function debug(message) {
    if (DEBUG) {
        console.log(message);
    }
}

// SQLite database setup
let db;
open({
  filename: 'slack_messages.db',
  driver: sqlite3.Database
}).then(async (database) => {
  db = database;
  await db.run('CREATE TABLE IF NOT EXISTS slack_messages (id INTEGER PRIMARY KEY, user_id TEXT, content TEXT, timestamp INTEGER, message_id TEXT)');

  // Check if the 'checked_for_duplicates' column exists
  const tableInfo = await db.all("PRAGMA table_info(slack_messages)");
  if (!tableInfo.some(column => column.name === 'checked_for_duplicates')) {
    await db.run('ALTER TABLE slack_messages ADD COLUMN checked_for_duplicates INTEGER DEFAULT 0');
  }

  console.log("SQLite database is ready");
});

// Slackからのメッセージをデータベースに記録する関数
async function recordMessage(userId, messageContent, messageId, checkedForDuplicates) {
    await db.run('INSERT INTO slack_messages (user_id, content, timestamp, message_id, checked_for_duplicates) VALUES (?, ?, ?, ?, ?)', [userId, messageContent, Date.now(), messageId, checkedForDuplicates]);
}

// Slackからのメッセージが重複しているかどうかをチェックする関数
async function isDuplicateMessage(userId, messageContent, messageId) {
    const tenMinutesAgo = Date.now() - 600000; // 10分前のタイムスタンプ
    const result = await db.get('SELECT * FROM slack_messages WHERE user_id = ? AND content = ? AND timestamp > ? AND message_id <> ?', [userId, messageContent, tenMinutesAgo, messageId]);
    return result !== undefined;
}

function validateConfig() {
    const requiredEnvVars = [
        'DISCORD_TOKEN', 'DISCORD_CHANNEL', 'DISCORD_CHANNEL_ID',
        'SLACK_BOT_TOKEN', 'SLACK_APP_TOKEN', 'SLACK_CHANNEL', 'SLACK_CHANNEL_ID',
        'PORT', 'DISCORD_ALLOWED_USER_IDS', 'SLACK_ALLOWED_USER_IDS'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingEnvVars.length > 0) {
        console.log("Missing required environment variables:", missingEnvVars.join(', '));
        process.exit(1);
    }
}

validateConfig();

function isAllowedUser(userId, allowedUserIds) {
    debug(`Checking if user ID ${userId} is in allowed list: ${allowedUserIds}`);
    return allowedUserIds.includes(userId);
}

// Slack WebClient setup
const slack_client = new WebClient(SLACK_BOT_TOKEN);

// Discord client setup
const discord_client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
let discord_channel;

discord_client.on('ready', async () => {
    discord_channel = DISCORD_CHANNEL_ID ? discord_client.channels.cache.get(DISCORD_CHANNEL_ID) 
                                         : discord_client.channels.cache.find(channel => channel.name === DISCORD_CHANNEL);
    if (!discord_channel) {
        console.error("Error: No Discord channel found.");
        process.exit(1);
    }
    console.log("Discord connected");
});

function formatSlackMessageToDiscord(message) {
    return message.replace(/<http(.*?)\|(.*?)>/g, '[$2](http$1)');
}

const sentMessageIds = new Set();

const slackSocketClient = new SocketModeClient({ appToken: SLACK_APP_TOKEN });

slackSocketClient.on('message', async ({ event }) => {
    if (event.channel !== SLACK_CHANNEL_ID || event.type !== 'message' || !isAllowedUser(event.user, SLACK_ALLOWED_USER_IDS)) {
        return;
    }

    let messageId = uuidv4();
    let messageContent = event.text;

    // メッセージが重複しているかチェック
    const isDuplicate = await isDuplicateMessage(event.user, messageContent, messageId);
    if (isDuplicate) {
        console.log("重複したメッセージが検出されました。Discordへは送信しません。");
        return;
    }

    // メッセージをデータベースに記録（重複チェック済みとして）
    await recordMessage(event.user, messageContent, messageId, 1);

    // メッセージをフォーマットしてDiscordに送信
    const formattedMessage = formatSlackMessageToDiscord(messageContent);
    discord_channel.send(formattedMessage);

    // このメッセージが送信されたとマーク
    sentMessageIds.add(messageId);
});

slackSocketClient.start();

app.use(express.json());
const serverPort = PORT || 3000;
app.listen(serverPort, () => {
    console.log(`Server running on port ${serverPort}`);
});

discord_client.login(DISCORD_TOKEN);
