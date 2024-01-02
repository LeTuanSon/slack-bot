const express = require('express');
const bodyParser = require('body-parser');
var app = express();
const { WebClient } = require('@slack/web-api');

const { App } = require('@slack/bolt');

const axios = require('axios');

require('dotenv').config();

const port = process.env.PORT || 3000;

const apiKey = process.env.API_KEY ;

const slackToken = process.env.SLACK_BOT_TOKEN;

const slackClient = new WebClient(slackToken);

const bolt = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: slackToken
});

app.post('/slack/events', function (req, res) {
  const { challenge } = req.body;

  res.send({ challenge });
});

app.get('/status', (request, response) => {
  const status = {
     'Status': 'Running'
  };
  
  response.send(status);
});

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
  
    return await axios.request(options).then(function (response) {
  
      return response.data.data.translations[0].translatedText;
  
    }).catch(function (error) {
  
      console.error(error);
  
    });
  
  }

  bolt.message(async ({ message, client, logger }) => {
    console.log('Translate!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    if (message.subtype !== undefined
      || message.subtype !== 'bot_message'
      || message.subtype !== 'file_share'
      || message.subtype !== 'thread_broadcast') {
        try {
            const mess = message.text
            const textEn = "Test"
            // const textVi = await translate(mess, 'ja','vi')
            await client.chat.update({ 
              token: slackToken, 
              ts: message.ts, 
              channel: message.channel, 
              text: `${mess} \n :flag-gb:: ${textEn}`, 
              as_user: true });
        } catch (error) {
            logger.error(error);
        }      
    }
  
  });
  
  (async () => {
    // Start the app
    await bolt.start(port);
  
    console.log('⚡️ Bolt app is running!');
  })();