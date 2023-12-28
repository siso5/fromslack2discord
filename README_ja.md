
# fromslack2discord (2023.12.10)

> 日本語 README.ver 
>[README_ja.md](README_ja.md)

> 英語 README.ver
> [README.md](README.md)


# 概要
```
slackの通知へ通知を飛ばす機能しかないソフトを使っていて不便だなと思い制作しました。
端的にこのプログラムの内容を説明すると
slackへ送られてきたテキスト(markdown対応)通知をdiscordにそのまま、飛ばすものになります。
```

# 仕様
- 1度、同一ユーザーから同じ文章が送られていた場合（例えば、編集、公開を繰り返し行った場合の通知など）は10分間、送られなくなります。

- slackからdiscordへの転送は各任意の一つのチャンネルになります。

- 環境変数に書かれたユーザーの発言のみが転送することができます。
※ この許可するユーザーは複数設定可能。
- slackに送られたmarkdown表示のまま、discordに送ることができます。

- URLやメッセージや絵文字は対応しています。

- 添付ファイルや画像は転送できません。ご注意ください。

# 導入方法
まず、fromslack2discord/src/env.exampleを参考に.env（環境変数）を設定してください。
※ PORTについては、事前にport3000をプログラム上では指定していますが、環境変数(src/.env)に書いたほうが優先されます。

# 事前準備


### Config(.env)
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

## インストール
```sh
git clone https://github.com/siso5/fromslack2discord&& cd fromslack2discord
npm install
npm start
```

# おすすめの導入方法

pm2を用いた方法がおすすめです。

pm2をまずはインストールしているかを確認します。
```sh
pm2 -help
```

```sh
pm2 start slack2discord.js
```

再起動した際にも、pm2の動かしていたシステムが自動的に起動するようにするために以下のコードを実行してください。


```sh
pm2 startup
```
```sh
pm2 save
```

※詳しくはこちら
> URL:[https://pm2.keymetrics.io/docs/usage/startup/#command](https://pm2.keymetrics.io/docs/usage/startup/#command)

# 更新履歴