#Pingbridge
####A message bridge between slack and hipchat

###Config
Edit the config.json
######hipchat
+ "auth_token": Hipchat auth token. Create on at https://hipchat.com/account/api (needs following scopes: Send Message, Send Notification, View Messages, View Room)
+ rooms: An array with the rooms to monitor
+ forward_room: Room to display messages from slack
+ room_token: same as auth_token (or you can generate one by going to HipChat.com > Rooms tab > Click the room you want > Select Tokens [BETA] on the left-hand side > generate a new token)
+ keywords: List of keywords to bridge the to slack
+ ping_template: message template for the forwarded message

######slack
+ auth_token: Slack auth token: Create an bot at https://my.slack.com/services/new/bot and copy the token
+ forward_room: Room to display messages from hipchat (example: '#ping')
+ keywords: List of keywords to bridge the to hipchat
+ ping_template: message template for the forwarded message

###Other things
Make sure to invite the slack bot to the channels that should be monitored.

###Run the bridge
Just run ```node main.js```
