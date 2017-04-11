'use strict'
var APIAI_ACCESS_TOKEN = process.env.APIAI_ACCESS_KEY
var requestIp = require('request-ip');
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
var hrHelper = require('./HrHelper.js');
var employee = require('./employeeSide.js')
const apiAiService = apiai(APIAI_ACCESS_TOKEN);
var pg = require('pg');
var sessionId = uuid.v1();
var APIAI_ACCESS_TOKEN = process.env.APIAI_ACCESS_KEY;
var SLACK_ACCESS_TOKEN = process.env.SLACK_APP_ACCESS_KEY;
var SLACK_BOT_TOKEN = process.env.SLACK_BOT_ACCESS_KEY;
var fs = require('fs');
var userId = ""
var employeeChannel = "";
var managerChannel = "D3RR2RE68"
var Constants = require('./Constants.js');
const requestify = require('requestify');
var IP = process.env.SLACK_IP
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
exports.bot = bot;

function storeHrSlackInformation(email, msg) {
  console.log("IP" + IP)
  request({
    url: 'http://' + IP + '/api/v1/toffy/get-record', //URL to hitDs
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'JSESSIONID=24D8D542209A0B2FF91AB2A333C8FA70'
    },
    body: email
    //Set the body as a stringcc
  }, function (error, response, body) {

    console.log(JSON.stringify(body))
    if (response.statusCode == 404) {

      console.log("the employee  not found ")
      requestify.post('http://' + IP + '/api/v1/toffy', {
        "email": email,
        "hrChannelId": msg.body.event.channel,
        "managerChannelId": "",
        "slackUserId": msg.body.event.user,
        "teamId": msg.body.team_id,
        "userChannelId": ""
      })
        .then(function (response) {
          // Get the response body
          response.getBody();
        });

    }

    else if (response.statusCode == 200) {
      console.log((JSON.parse(body)).hrChannelId)
      console.log(msg.body.event.channel)
      if (((JSON.parse(body)).hrChannelId) != (msg.body.event.channel)) {

        var userChId = JSON.parse(body).userChannelId;
        var managerChId = JSON.parse(body).managerChannelId;
        request({
          url: "http://" + IP + "/api/v1/toffy/" + JSON.parse(body).id, //URL to hitDs
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': 'JSESSIONID=24D8D542209A0B2FF91AB2A333C8FA70'
          },
          body: email
          //Set the body as a stringcc
        }, function (error, response, body) {
          console.log("The record has been deleted");

        });
        requestify.post('http://' + IP + '/api/v1/toffy', {
          "email": email,
          "hrChannelId": msg.body.event.channel,
          "managerChannelId": managerChId,
          "slackUserId": msg.body.event.user,
          "teamId": msg.body.team_id,
          "userChannelId": userChId
        })
          .then(function (response) {

            // Get the response body
            response.getBody();
          });
      }
    }
  });
}
//send the text to api ai 

function sendRequestToApiAi(emailValue, msg) {
  hrHelper.getRoleByEmail(emailValue, "HR", function (role) {
    if (role == true) {
      storeHrSlackInformation(emailValue, msg);

      var text = msg.body.event.text;
      let apiaiRequest = apiAiService.textRequest(text,
        {
          sessionId: sessionId
        });

      apiaiRequest.on('response', (response) => {
        let responseText = response.result.fulfillment.speech;
        if (responseText == "showEmployeeProfile") {
          console.log("eresponse:::" + JSON.stringify(response))
          console.log("employeeEmail:::" + response.result.parameters.email)
          var employeeEmail = "";
          if (response.result.parameters.any) {
            employeeEmail = response.result.parameters.any + "@exalt.ps"
            employeeEmail = employeeEmail.replace(/ /g, ".");
            employee.showEmployeeProfile(emailValue, employeeEmail, msg);

          }
          else if (response.result.parameters.email) {
            employeeEmail = response.result.parameters.email
            employee.showEmployeeProfile(emailValue, employeeEmail, msg);

          } else msg.say("There is an error in user ID ")

        }
        else if (responseText == "showEmployeeStats") {
          console.log("eresponse:::" + JSON.stringify(response))
          console.log("employeeEmail:::" + response.result.parameters.email)
          var employeeEmail = "";
          if (response.result.parameters.any) {
            employeeEmail = response.result.parameters.any + "@exalt.ps"
            employeeEmail = employeeEmail.replace(/ /g, ".");
            employee.showEmployeeStats(emailValue, employeeEmail, msg);

          }
          else if (response.result.parameters.email) {
            employeeEmail = response.result.parameters.email
            employee.showEmployeeStats(emailValue, employeeEmail, msg);

          } else msg.say("There is an error in user ID ")
        }
        else if (responseText == "AddCompensationTimeOff") {
          var employeeEmail = ""
          if (response.result.parameters.email) {
            //<mailto:ibrahim.zahra@exalt.ps|ibrahim.zahra@exalt.ps>
            if ((response.result.parameters.email).indexOf('mailto') > -1) {
              employeeEmail = response.result.parameters.email
              employeeEmail = employeeEmail.toString().split('|')
              employeeEmail = employeeEmail[1];
              employeeEmail = employeeEmail.replace(/>/g, "");
              console.log("Email after split mail to ")
            }
            else {
              employeeEmail = response.result.parameters.email
           
            }


          } else if (response.result.parameters.any) {
            employeeEmail = response.result.parameters.any
            employeeEmail = response.result.parameters.any + "@exalt.ps"
            employeeEmail = employeeEmail.replace(/ /g, ".");
          }
          var type = response.result.parameters.period_types
          if (type == "weeks" || type == "week") {
            type = "week"
          } else if (type == "days" || type == "days") {
            type = "day"
          } else if (type == "hour" || type == "hours") {
            type = "hour"
          }
          var numberOfTimeOff = response.result.parameters.number
          console.log("employeeEmail" + employeeEmail)
          employee.sendCompensationConfirmationToHr(emailValue, employeeEmail, numberOfTimeOff, type, msg);

        } else if (responseText == "remainingDaysLeft") {
          var quantity_Type = response.result.parameters.quantityType;
          var period_types = response.result.parameters.period_types;
          var number = response.result.parameters.number;
          hrHelper.showEmployeesBalance(msg, emailValue, number, quantity_Type, period_types)

        }

        else msg.say(responseText);


      });
      apiaiRequest.on('error', (error) => console.error(error));
      apiaiRequest.end();
    } else msg.say("Sorry!.You dont have the permession to use this bot.")
  })

}
//get the email of the sender by request slack Api and compare Ids to get the email of mapped ID
function getMembersList(Id, msg) {
  var emailValue = "";
  request({
    url: Constants.SLACK_MEMBERS_LIST_URL + "" + SLACK_ACCESS_TOKEN,
    json: true
  }, function (error, response, body) {

    if (!error && response.statusCode === 200) {
      var i = 0;
      while ((body.members[i] != null) && (body.members[i] != undefined)) {
        //compare IDs to get email of matched email
        if (body.members[i]["id"] == Id) {
          console.log(body.members[i]["profile"].email);
          emailValue = body.members[i]["profile"].email;
          sendRequestToApiAi(emailValue, msg);
          break;
        }
        console.log(body.members[i]["profile"].email);

        i++;
      }
    }
  });
}
/*--------------___________________________________________________----------------------
    listen for hr messages 
     -------------____________________________________________________---------------------
     */

var app = slapp.attachToExpress(express())
slapp.message('(.*)', ['direct_message'], (msg, text, match1) => {
  if (msg.body.event.user == "U3V5LRL76") {
    console.log("message from bot ")

  } else {


    var stringfy = JSON.stringify(msg);
    console.log("the message is ");
    console.log(stringfy);
    getMembersList(msg.body.event.user, msg)
  }
})
/*--------------___________________________________________________----------------------
space
-------------____________________________________________________---------------------
*/


slapp.action('manager_confirm_reject', 'confirm', (msg, value) => {
  var arr = value.toString().split(";")
  var userEmail = arr[0];
  var vacationId = arr[1];
  var approvalId = arr[2]
  var hrEmail = arr[3]
  hrHelper.sendVacationPutRequest(vacationId, approvalId, hrEmail, "Approved")
  request({
    url: 'http://' + IP + '/api/v1/toffy/get-record', //URL to hitDs
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'JSESSIONID=24D8D542209A0B2FF91AB2A333C8FA70'
    },
    body: userEmail
    //Set the body as a stringcc
  }, function (error, response, body) {
    var responseBody = JSON.parse(body);
    hrHelper.sendFeedBackMessage(responseBody)
    msg.say("You have accepted the time off request.")


  });
})

slapp.action('confirm_reject_compensation', 'confirm', (msg, value) => {
  var arr = value.toString().split(",")
  var hrEmail = arr[0];
  var userEmail = arr[1];
  console.log("userEmail111" + userEmail)
  var numberOfExtraTimeOff = arr[2];
  var type = arr[3]

  //hrHelper.sendVacationPutRequest(vacationId, approvalId, hrEmail, "Approved")
  request({
    url: 'http://' + IP + '/api/v1/toffy/get-record', //URL to hitDs
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'JSESSIONID=24D8D542209A0B2FF91AB2A333C8FA70'
    },
    body: userEmail
    //Set the body as a stringcc
  }, function (error, response, body) {
    var responseBody = JSON.parse(body);
    var message = {
      'type': 'message',
      'channel': responseBody.userChannelId,
      user: responseBody.slackUserId,
      text: 'what is my name',
      ts: '1482920918.000057',
      team: responseBody.teamId,
      event: 'direct_message'
    };
    console.log("userEmail" + userEmail)
    console.log("responseBody.userChannelId" + responseBody.userChannelId)
    console.log("responseBody.slackUserId" + responseBody.slackUserId)
    bot.startConversation(message, function (err, convo) {
      console.log("cannot send message")

      if (!err) {
        var text12 = {
          "text": "Hi, You granted " + numberOfExtraTimeOff + " extra " + type + " from the HR Admin.",
        }
        var stringfy = JSON.stringify(text12);
        var obj1 = JSON.parse(stringfy);
        bot.reply(message, obj1);

      }
    });
    msg.say("Added")

  });
})


slapp.action('manager_confirm_reject', 'reject', (msg, value) => {
  var arr = value.toString().split(";")
  var userEmail = arr[0];
  var vacationId = arr[1];
  var approvalId = arr[2]
  var hrEmail = arr[3]
  console.log("Regected userEmail " + userEmail)
  console.log("Regected vacationId " + vacationId)
  console.log("Regected approvalId  " + approvalId)

  console.log("Regected hrEmail " + hrEmail)

  hrHelper.sendVacationPutRequest(vacationId, approvalId, hrEmail, "Rejected")
  request({
    url: 'http://' + IP + '/api/v1/toffy/get-record', //URL to hitDs
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'JSESSIONID=24D8D542209A0B2FF91AB2A333C8FA70'
    },
    body: userEmail
    //Set the body as a stringcc
  }, function (error, response, body) {
    var responseBody = JSON.parse(body);

    var message = {
      'type': 'message',
      'channel': responseBody.userChannelId,
      user: responseBody.slackUserId,
      text: 'what is my name',
      ts: '1482920918.000057',
      team: responseBody.teamId,
      event: 'direct_message'
    };
    bot.startConversation(message, function (err, convo) {
      if (!err) {
        var text12 = {
          "text": "HR has rejected your time off request.Sorry! ",
        }
        var stringfy = JSON.stringify(text12);
        var obj1 = JSON.parse(stringfy);
        bot.reply(message, obj1);
      }
    });
  });

  msg.say("you have rejected the time off request")
})


slapp.action('manager_confirm_reject', 'dont_detuct', (msg, value) => {
  var arr = value.toString().split(";")
  var userEmail = arr[0];
  var vacationId = arr[1];
  var approvalId = arr[2]
  var hrEmail = arr[3]
  console.log("Regected userEmail " + userEmail)
  console.log("Regected vacationId " + vacationId)
  console.log("Regected approvalId " + approvalId)

  console.log("Regected hrEmail " + hrEmail)

  hrHelper.sendVacationPutRequest(vacationId, approvalId, hrEmail, "ApprovedWithoutDeduction")
  request({
    url: 'http://' + IP + '/api/v1/toffy/get-record', //URL to hitDs
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'JSESSIONID=24D8D542209A0B2FF91AB2A333C8FA70'
    },
    body: userEmail
    //Set the body as a stringcc
  }, function (error, response, body) {
    var responseBody = JSON.parse(body);

    var message = {
      'type': 'message',
      'channel': responseBody.userChannelId,
      user: responseBody.slackUserId,
      text: 'what is my name',
      ts: '1482920918.000057',
      team: responseBody.teamId,
      event: 'direct_message'
    };
    bot.startConversation(message, function (err, convo) {


      if (!err) {
        var text12 = {
          "text": "HR has accepted your time off request without detuction. Enjoy!",
        }
        var stringfy = JSON.stringify(text12);
        var obj1 = JSON.parse(stringfy);
        bot.reply(message, obj1);

      }
    });
  });

  msg.say("you have accepted  the time off request but without detuction.")


})
app.get('/', function (req, res) {

  res.send('Hello')
})

console.log('Listening on :' + process.env.PORT)
app.listen(process.env.PORT)
