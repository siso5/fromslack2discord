# fromslacl2fdiscord (2023.12.10)

## Install
```sh
git clone https://github.com/siso5/fromslack2discord&& cd discord2slack
npm install
# Configure your stuff (see Config section)
npm start
```

## Config
You have to set the following values in discord2slack.js
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