var express = require('express');
var app = express();
var bodyParser = require('body-parser');

const { WebClient } = require(slack/web-api);

const { createEventAdapter } = require(slack/events-api);

const axios = require(axios);

require(dotenv).config();

const port = process.env.PORT || 3000;

const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;

const apiKey = process.env.API_KEY ;

const slackEvents = createEventAdapter(slackSigningSecret);

const slackToken = process.env.SLACK_BOT_TOKEN;

const slackClient = new WebClient(slackToken);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/translate', function (req, res) {
  const { challenge } = req.body;
  return res.send({ challenge });
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

  slackEvents.on('message', async (event) => {

    if (event.bot_id === undefined) {
  
      (async () => {
  
          try {
  
              const mess = event.text
  
              const textEn = await translate(mess, 'ja','en')
  
              const textVi = await translate(mess, 'ja','vi')
  
              await slackClient.chat.postMessage({ channel: event.channel, text: `:flag-gb:: ${textEn} \n:flag-vn:: ${textVi}`, thread_ts: event.event_ts, challenge: event.bot_id.challenge })
  
          } catch (error) {
  
              console.log(error)
  
          }
  
        })();
  
    }
  
  });
  
   
  
  slackEvents.on('error', console.error);
  
   
  
  slackEvents.start(port).then(() => {
  
    console.log(`Server started on port ${port}`)
  
  });