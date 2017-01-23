'use strict'
var APIAI_ACCESS_TOKEN = process.env.APIAI_ACCESS_KEY
const express = require('express')
const Slapp = require('slapp')
const BeepBoopConvoStore = require('slapp-convo-beepboop')
const BeepBoopContext = require('slapp-context-beepboop')
const bodyParser = require('body-parser');
const uuid = require('node-uuid');
const request = require('request');
const JSONbig = require('json-bigint');
const async = require('async');
const apiai = require('apiai');
const APIAI_LANG = 'en';
const apiAiService = apiai(APIAI_ACCESS_TOKEN);
var pg = require('pg');
var sessionId = uuid.v1();
var db = require('node-localdb');
var userdb = db('./userDetails1.json')
var APIAI_ACCESS_TOKEN = process.env.APIAI_ACCESS_KEY;
var SLACK_ACCESS_TOKEN = process.env.SLACK_APP_ACCESS_KEY;
var SLACK_BOT_TOKEN = process.env.SLACK_BOT_ACCESS_KEY;
var fs = require('fs');
var userId = ""
var employeeChannel = "";
var managerChannel = "D3RR2RE68"
var Constants = require('./Constants.js');
pg.defaults.ssl = true;
if (!process.env.PORT) throw Error('PORT missing but required')
var slapp = Slapp({
  convo_store: BeepBoopConvoStore(),
  context: BeepBoopContext()
})
var Botkit = require('./lib/Botkit.js');
var controller = Botkit.slackbot({
  debug: true,
});
console.log("the token is " + APIAI_ACCESS_TOKEN)
var bot = controller.spawn({
  token: SLACK_BOT_TOKEN

}).startRTM();
//send the text to api ai 
function sendRequestToApiAi(emailValue, msg) {
  userdb.findOne({ email: emailValue }).then(function (u) {
    if (u == undefined)
      console.log("the not database is defined every where")
    else console.log("defined every where ")
  });

  var text = msg.body.event.text;
  let apiaiRequest = apiAiService.textRequest(text,
    {
      sessionId: sessionId
    });

  apiaiRequest.on('response', (response) => {
    let responseText = response.result.fulfillment.speech;
    msg.say(responseText);


  });
  apiaiRequest.on('error', (error) => console.error(error));
  apiaiRequest.end();
}
//get all information about team users like email ,name ,user id ...etc
function getMembersList(Id, msg) {
  var emailValue = "";
  request({
    url: Constants.SLACK_MEMBERS_LIST_URL + "" + SLACK_ACCESS_TOKEN,
    json: true
  }, function (error, response, body) {

    if (!error && response.statusCode === 200) {
      var i = 0;
      while ((body.members[i] != null) && (body.members[i] != undefined)) {

        if (body.members[i]["id"] == Id) {
          console.log(body.members[i]["profile"].email);
          emailValue = body.members[i]["profile"].email;
          userdb.findOne({ email: emailValue }).then(function (u) {
            if (u == undefined) {
              console.log("New user request the service");
              userdb.insert({ email: emailValue, channel: msg.body.event.channel }).then(function (u) {
              });
            }
            else console.log("the user already exist")
          });
          sendRequestToApiAi(emailValue, msg);
          break;
        }
        console.log("the email:");
        console.log(body.members[i]["profile"].email);

        i++;
      }
    }
  });
}

var app = slapp.attachToExpress(express())
slapp.message('(.*)', ['direct_message'], (msg, text, match1) => {
  if (msg.body.event.user == "U3R213B2L") {
    console.log("message from bot ")

  } else {

    var stringfy = JSON.stringify(msg);
    console.log("the message is ");
    console.log(stringfy);
    getMembersList(msg.body.event.user, msg)
  }
})
slapp.action('manager_confirm_reject', 'confirm', (msg, value) => {
  pg.connect(process.env.Db_URL, function (err, client) {
    if (err) throw err;
    console.log('Connected to postgres! Getting schemas...');

    client
      .query("select * from UsersDetails where useremail=" + "'" + value + "'" + ";")
      .on('row', function (row) {
        employeeChannel = row.channelid;
        userId = row.userid


      });
  });

  msg.say("You accepted the request")
  var message = {
    'type': 'message',
    'channel': employeeChannel,
    user: userId,
    text: 'what is my name',
    ts: '1482920918.000057',
    team: "T3FN29ZSL",
    event: 'direct_message'
  };
  bot.startConversation(message, function (err, convo) {


    if (!err) {
      var text12 = {
        "text": "Manager @name has accepted your time off request.Enjoy it.",
      }
      var stringfy = JSON.stringify(text12);
      var obj1 = JSON.parse(stringfy);
      bot.reply(message, obj1);

    }
  });

})
slapp.action('manager_confirm_reject', 'reject', (msg, value) => {
  pg.connect(process.env.Db_URL, function (err, client) {
    if (err) throw err;
    console.log('Connected to postgres! Getting schemas...');

    client
      .query("select * from UsersDetails where useremail=" + "'" + value + "'" + ";")
      .on('row', function (row) {
        employeeChannel = row.channelid;
        userId = row.userid


      });
  });
  var message = {
    'type': 'message',
    'channel': employeeChannel,
    user: userId,
    text: 'what is my name',
    ts: '1482920918.000057',
    team: "T3FN29ZSL",
    event: 'direct_message'
  };
  bot.startConversation(message, function (err, convo) {


    if (!err) {
      var text12 = {
        "text": "Manager @name has rejected your time off request.Sorry! ",
      }
      var stringfy = JSON.stringify(text12);
      var obj1 = JSON.parse(stringfy);
      bot.reply(message, obj1);

    }
  });
})
app.get('/', function (req, res) {
  res.send('Hello')
})

console.log('Listening on :' + process.env.PORT)
app.listen(process.env.PORT)
