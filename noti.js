/* eslint-disable require-jsdoc */
const request = require('request');
const fs = require('fs');

async function sendMessage(dict) {
  const postUrl = JSON.parse(fs.readFileSync('./config.json','utf8'))['rc-hook'];
  let id = dict.id;
  const messageTemplate = {
  "text": dict.title,
  "attachments": [
    {
      "title": "link",
      "title_link": `https://translate.pdis.nat.gov.tw/history#${id}`,
      "text": '',
    }
  ]
  };
  request.post({url: postUrl, json: messageTemplate},
      function(err, httpResponse, body) { }
  );
}
exports.sendMessage = sendMessage;
