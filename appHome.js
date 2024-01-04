const { JsonDB } = require('node-json-db');
const { Config } = require( 'node-json-db/dist/lib/JsonDBConfig' );
const db = new JsonDB(new Config('settings', true, false, '/'));

const app = require('./index');
var mysql = require('mysql');
/*
 * Home View - Use Block Kit Builder to compose: https://api.slack.com/tools/block-kit-builder
 */

var connection = mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "sonlt1234",
    database: "sakila"
});

var userSettings = [];
const languageLabel = {
  "en": "English",
  "ja": "Japanese",
  "vi": "Vietnamese"
};

const updateView = async(user) => {
  // Intro message - 
  
  let blocks = [ 
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Welcome!* \nThis is a home for Demo app!"
      },
      accessory: {
        type: "button",
        action_id: "add_setting", 
        text: {
          type: "plain_text",
          text: "New",
          emoji: true
        }
      }
    },
    {
      type: "divider"
    }
  ];

  // Append new data blocks after the intro - 
  
  userSettings = [];

  try {
    const rawData = await db.getData(`/${user}/data/`);
    if (Array.isArray(rawData)) {
      userSettings = rawData.slice().reverse(); // Reverse to make the latest first
      userSettings = userSettings.slice(0, 50); // Just display 20. BlockKit display has some limit.
    }

  } catch(error) {
    console.error(`******************************${error}`); 
  };
  
  if(userSettings) {
    let settingBlocks = [];
    
    userSettings.forEach(function(value, i) {
      
      let primaryLang = value.primaryLang;
      let secondaryLang = value.secondaryLang;
            
      settingBlocks = [
        {
          block_id: "savedSetting",
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Translate from ${primaryLang}\nTranslate to ${secondaryLang}`
          },
          accessory: {
            type: "button",
            action_id: "edit_setting", 
            text: {
              type: "plain_text",
              text: "Edit",
              emoji: true
            },
            value: i.toString()
          }
        },
        // {
        //   type: "section",
        //   text: {
        //     type: "mrkdwn",
        //     text: `Translate to ${secondaryLang}`
        //   }
        // },
        {
          type: "divider"
        }
      ];
      blocks = blocks.concat(settingBlocks);
    
    })
  }

  // The final view -
  
  let view = {
    type: 'home',
    callback_id: 'home_view',
    title: {
      type: 'plain_text',
      text: 'Setting Languages'
    },
    blocks: blocks
  }
  
  return JSON.stringify(view);
};



/* Display App Home */

const createHome = async(user, data) => {

    // connection.connect(function(err) {
    //     if (err) throw err;
    //     console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!Connected");
    // })
  if(data) {     
    // Store in a local DB
    db.push(`/${user}/data[]`, data, true);   
  }
  
  const userView = await updateView(user);
  
  return userView;
};



/* Open a modal */

const openModal = (index) => {

  const data = (index >= 0 && userSettings.length > 0) ? userSettings[index] : {};
  
  const modal = {
    type: 'modal',
    callback_id: 'modal_view',
    title: {
      type: 'plain_text',
      text: 'Language Setting'
    },
    submit: {
      type: 'plain_text',
      text: 'Save'
    },
    blocks: [
      // Dropdown channel list
      {
        type: "section",
        block_id: "channelSelected",
        text: {
          type: "mrkdwn",
          text: "Pick a conversation from the dropdown list"
        },
        accessory: {
          action_id: "channel_select",
          type: "conversations_select",
          placeholder: {
            type: "plain_text",
            text: "Select an item"
          }
        }
      },
      // Dropdown primary language
      {
        type: "input",
        block_id: "lang01",
        label: {
          type: "plain_text",
          text: "Primary Language",
        },
        element: {
          type: "static_select",
          action_id: "fromLang",
          initial_option: {
            text: {
                type: "plain_text",
                text: languageLabel[data.primaryLang] ?? "English"
              },
              value: data.primaryLang ?? "en"
          },
          options: [
            {
              text: {
                type: "plain_text",
                text: "English"
              },
              value: "en"
            },
            {
              text: {
                type: "plain_text",
                text: "Japanese"
              },
              value: "ja"
            },
            {
              text: {
                type: "plain_text",
                text: "Vietnamese"
              },
              value: "vi"
            }
          ]
        }
      },
      
      // Drop-down secondary language  
      {
        type: "input",
        block_id: "lang02",
        label: {
          type: "plain_text",
          text: "Second Language",
        },
        element: {
          type: "static_select",
          action_id: "toLang",
          initial_option: {
            text: {
                type: "plain_text",
                text: languageLabel[data.secondaryLang] ?? "English"
              },
              value: data.secondaryLang ?? "en"
          },
          options: [
            {
              text: {
                type: "plain_text",
                text: "English"
              },
              value: "en"
            },
            {
              text: {
                type: "plain_text",
                text: "Japanese"
              },
              value: "ja"
            },
            {
              text: {
                type: "plain_text",
                text: "Vietnamese"
              },
              value: "vi"
            }
          ]
        }
      
      }
    ]
  };
  
  return modal;
};


module.exports = { createHome, openModal };