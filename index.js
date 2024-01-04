const express = require('express');
const bodyParser = require('body-parser');
var app = express();
const { WebClient } = require('@slack/web-api');

const { App } = require('@slack/bolt');

const axios = require('axios');

const appHome = require('./appHome');

require('dotenv').config();

const port = process.env.PORT || 3000;

const apiKey = process.env.API_KEY ;

const slackToken = process.env.SLACK_BOT_TOKEN;

const slackUserToken = process.env.SLACK_USER_TOKEN;

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
    console.log(`++++++++++++++++++++++++++++++++${message.user}`);
    if (message.subtype !== undefined
      || message.subtype !== 'bot_message'
      || message.subtype !== 'file_share'
      || message.subtype !== 'thread_broadcast') {
        try {
            const mess = message.text
            const textEn = "Test"
            // const textVi = await translate(mess, 'ja','vi')
            await client.chat.update({ 
              token: slackUserToken, 
              ts: message.ts, 
              channel: message.channel, 
              text: `${mess} \n :flag-gb:: ${textEn}`, 
              as_user: true });
        } catch (error) {
            logger.error(error);
        }      
    }
  
  });

  bolt.event('app_home_opened', async ({ event, context, payload }) => {
    console.log(`=====================================${event.user}`);
    // Display App Home
    const homeView = await appHome.createHome(event.user);
    
    try {
      const result = await bolt.client.views.publish({
        token: slackToken,
        user_id: event.user,
        view: homeView
      });
      
    } catch(e) {
      bolt.error(e);
    }
    
  });

  bolt.action('add_setting', async ({ body, context, ack }) => {
    ack();
    const data = {
      primaryLang: "",
      secondaryLang: ""
    }
    // Open a modal window with forms to be submitted by a user
    const view = appHome.openModal(-1);
    
    try {
      const result = await bolt.client.views.open({
        token: slackToken,
        trigger_id: body.trigger_id,
        view: view
      });
      
    } catch(e) {
      console.log(e);
      bolt.error(e);
    }
  });

  bolt.view('modal_view', async ({ ack, body, context, view }) => {
    ack();

    const data = {
      primaryLang: view.state.values.lang01.fromLang.selected_option.value,
      secondaryLang: view.state.values.lang02.toLang.selected_option.value
    }
  
    const homeView = await appHome.createHome(body.user.id, data);
  
    try {
      const result = await bolt.client.apiCall('views.publish', {
        token: slackToken,
        user_id: body.user.id,
        view: homeView
      });
  
    } catch(e) {
      console.log(e);
      bolt.error(e);
    }
      
  });
  
  bolt.action('edit_setting', async ({ body, context, ack }) => {
    ack();
    console.log(`++++++++++++++++++++++++++++${body.value}`);
    // Open a modal window with forms to be submitted by a user
    const view = appHome.openModal(parseInt(body.value));
    
    try {
      const result = await bolt.client.views.open({
        token: slackToken,
        trigger_id: body.trigger_id,
        view: view
      });
      
    } catch(e) {
      console.log(e);
      bolt.error(e);
    }
  });

  (async () => {
    // Start the app
    await bolt.start(port);
  
    console.log('⚡️ Bolt app is running!');
  })();