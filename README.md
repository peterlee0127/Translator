# Translator
Translator



# How to use: 

### Arch
'Translator' is the bot, for getting receipt and translated file.
'Translator/web' is the web UI, display the information.

ScreenShot of Web.

<img src="01.png" width="50%">

FIrst page for submit the content.

<img src="02.png" width="50%">

History Page for get the receipt and files.

Use bot.

```
npm install 
node bot.js
## Login with Account and password
# When first time auth with google/account.
change logined to false.
at bot.js
const logined = false;

If you logined sucessful, change 
const logined = true;

pm2 start   --merge-logs --log-date-format="YYYY-MM-DD HH:mm Z" --cron "0 */3 * * *" -n bot bot.js
```

Use web
```
npm install
node server.js
```



## For Bot

## example: config.json

{
    "account": "user@xxxxx",
    "password": "password",
    "mailgunkey": "keyx",
    "targets": ["user1@gmail.com","user2@gmail.com"]
}

```

```

```
## For Gengo Web Service
Gengo API key.
web/config.json

{
    "publicKey":"xxxxxxxx",
    "privateKey":"xxxxxxxxxxxx",
    "sandbox": false
}
```


