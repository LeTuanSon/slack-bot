const express = require('express');
const bodyParser = require('body-parser');
var app = express();
const { WebClient } = require('@slack/web-api');

const { slackBolt } = require('@slack/bolt');

const axios = require('axios');

require('dotenv').config();

const port = process.env.PORT || 3000;

const apiKey = process.env.API_KEY ;

const slackToken = process.env.SLACK_BOT_TOKEN;

const slackClient = new WebClient(slackToken);

const bolt = new slackBolt({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: slackToken,
});

app.use(bodyParser.urlencoded({ extended: true }));

// app.post('/', function (req, res) {
//   const { text, channel, event_ts } = req.body;
//   async () => {
//     try {

//         const mess = text

//         const textEn = await translate(mess, 'ja','en')

//         const textVi = await translate(mess, 'ja','vi')

//         await slackClient.chat.postMessage({ channel: channel, text: `:flag-gb:: ${textEn} \n:flag-vn:: ${textVi}`, thread_ts: event_ts })

//     } catch (error) {

//         console.log(error)

//     }

//   };
// });

async function translate (text, form, to) {

    const encodedParams = new URLSearchParams();
  
    encodedParams.append("q", text);
  
    encodedParams.append("target", to);
  
    encodedParams.append("source", form);
  
    const options = {
  
      method: 'POST',
  
      url: 'https://google-translate1.p.rapidapi.com/language/translate/v2',
  
      headers: {
  
        'content-type': 'application/x-www-form-urlencoded',
  
        'Accept-Encoding': 'application/gzip',
  
        'X-RapidAPI-Key': apiKey,
  
        'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com'
  
      },
  
      data: encodedParams
  
    };
  
    return await request(options).then(function (response) {
  
      return response.data.data.translations[0].translatedText;
  
    }).catch(function (error) {
  
      console.error(error);
  
    });
  
  }

  bolt.message(async ({ message, client, logger }) => {

    if (message.subtype === undefined
      || message.subtype === 'bot_message'
      || message.subtype === 'file_share'
      || message.subtype === 'thread_broadcast') {

      (async () => {
          try {
              const mess = message.text
  
              const textEn = await translate(mess, 'ja','en')
  
              const textVi = await translate(mess, 'ja','vi')
  
              await client.chat.postMessage({ channel: message.channel, text: `:flag-gb:: ${textEn} \n:flag-vn:: ${textVi}`, thread_ts: message.thread_ts });
  
          } catch (error) {
              logger.error(error);
          }
        })();
    }
  
  });   
  
  (async () => {
    // Start the app
    await bolt.start(port);
  
    console.log('⚡️ Bolt app is running!');
  })();