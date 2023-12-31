# fromslack2discord (2023.12.10)

>Japanese README.ver 
>[README_ja.md](README_ja.md)

>English README.ver
>[README.md](README.md)


# Overview

```
The software I'm using only has the function to send notifications to Slack, which I found inconvenient, so I created this program. To succinctly describe what this program does: it takes text notifications (supports markdown) sent to Slack and forwards them directly to Discord.

```

# Specifications

- If the same message is sent more than once by the same user (e.g., notifications for repeated edits and publications), it will not be sent again for 10 minutes.
- The transfer from Slack to Discord is limited to one specific channel of your choice.
- Only the statements of users listed in the environment ※ variables can be transferred.
*==Multiple users can be set for this permission.==
- You can send markdown-formatted messages from Slack directly to Discord.
- URLs, messages, and emojis are supported.
- Please note that attachments and images cannot be transferred.

# Preliminary Preparation
- You need to obtain the app token for the Discord bot in advance.
- You also need to obtain the app token for the Slack bot in advance.

*The creation of each bot is not covered in this guide, so please research this on your own.


# Installation

- First, set up your .env (environment variables) referring to fromslack2discord/src/env.example.
*Regarding PORT, although port 3000 is specified in the program, the one written in the environment variables (src/.env) takes precedence.

- Config(.env)
```javascript
DISCORD_CHANNEL="****"
DISCORD_CHANNEL_ID="*******************"
DISCORD_ALLOWED_USER_IDS="123456789,111111111"
SLACK_BOT_TOKEN="xoxb-**+"
SLACK_APP_TOKEN="xapp-1-**+"
SLACK_CHANNEL="******"
SLACK_CHANNEL_ID="*********"
SLACK_CHANNEL_PRIVATE=false
SLACK_ALLOWED_USER_IDS="U*********,U*********,U*********"
PORT="5000"
```

# Installation
```sh
git clone https://github.com/siso5/fromslack2discord && cd fromslack2discord
npm install
npm start
```

# Recommended Installation Method

Using pm2 is recommended.
First, check if pm2 is installed.

```sh
pm2 -help
```
```sh
pm2 start slack2discord.js
```
To ensure that the system running on pm2 automatically starts upon reboot, please execute the following code.

```sh
pm2 startup
```
```sh
pm2 save
```
*For more details, please visit this
> URL: [https://pm2.keymetrics.io/docs/usage/startup/#command](https://pm2.keymetrics.io/docs/usage/startup/#command)

# Update History
 
