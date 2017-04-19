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
const confirmationFunctions = require('./ConfirmationMessages/confirmationFunctions')
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
var generalEmail = ""
var vacation_type1 = ""

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
        if (responseText == "vacationWithLeave") {
          var messageText = ""
          var employeeEmail = ""
          hrHelper.getTodayDate(function (today) {
            var time1 = "17:00:00";
            var time = "8:00:00";
            var date = today
            var date1 = today
            var timeOffCase = -1
            var flag = 1
            if (!(response.result.parameters.email || response.result.parameters.any || generalEmail != "")) {
              msg.say("please specify the user email with request")
            } else {
              if (response.result.parameters.email) {
                //<mailto:ibrahim.zahra@exalt.ps|ibrahim.zahra@exalt.ps>
                if ((response.result.parameters.email).indexOf('mailto') > -1) {
                  employeeEmail = response.result.parameters.email
                  employeeEmail = employeeEmail.toString().split('|')
                  employeeEmail = employeeEmail[1];
                  employeeEmail = employeeEmail.replace(/>/g, "");
                  console.log("Email after split mail to ")
                  generalEmail = employeeEmail
                }
                else {
                  employeeEmail = response.result.parameters.email
                  generalEmail = employeeEmail;
                }


              } else if (response.result.parameters.any) {
                employeeEmail = response.result.parameters.any
                employeeEmail = response.result.parameters.any + "@exalt.ps"
                employeeEmail = employeeEmail.replace(/ /g, ".");
                generalEmail = employeeEmail
              }


              if (response.result.parameters.sick_synonyms) {
                vacation_type1 = "sick"
              }

              if (response.result.parameters.time_off_types && !(response.result.parameters.time) && !(response.result.parameters.time1) && !(response.result.parameters.date) && !(response.result.parameters.date1)) {

                msg.say("Please specify the date and/or time ")



              }
              else if (response.result.parameters.sick_synonyms && !(response.result.parameters.time) && !(response.result.parameters.time1) && !(response.result.parameters.date) && !(response.result.parameters.date1)) {
                msg.say("Please specify the date and/or time ")


                vacation_type1 = "sick"

              } else if (!(response.result.parameters.time) && !(response.result.parameters.time1) && !(response.result.parameters.date) && !(response.result.parameters.date1)) {
                msg.say("Please specify the date and/or time ")
              }
              else {

                if (response.result.parameters.time && response.result.parameters.time1 && response.result.parameters.date && response.result.parameters.date1) {
                  time = response.result.parameters.time
                  time1 = response.result.parameters.time1
                  date = response.result.parameters.date;
                  date1 = response.result.parameters.date1;

                  timeOffCase = 1

                }
                else if (response.result.parameters.time && response.result.parameters.time1 && response.result.parameters.date1) {
                  time = response.result.parameters.time
                  time1 = response.result.parameters.time1
                  date = response.result.parameters.date1
                  date1 = response.result.parameters.date1

                  timeOffCase = 2

                } else if (response.result.parameters.time && response.result.parameters.time1 && response.result.parameters.date) {
                  time = response.result.parameters.time
                  time1 = response.result.parameters.time1
                  date = response.result.parameters.date
                  date1 = response.result.parameters.date
                  timeOffCase = 3

                }

                else if (response.result.parameters.time && response.result.parameters.date && response.result.parameters.date1) {
                  time = response.result.parameters.time
                  time1 = response.result.parameters.time1
                  date = response.result.parameters.date
                  date1 = response.result.parameters.date1
                  timeOffCase = 4

                } else if (response.result.parameters.time && response.result.parameters.time1) {
                  time = response.result.parameters.time
                  time1 = response.result.parameters.time1
                  timeOffCase = 5

                } else if (response.result.parameters.time && response.result.parameters.date) {
                  time = response.result.parameters.time
                  date = response.result.parameters.date
                  date1 = response.result.parameters.date
                  timeOffCase = 6

                }
                else if (response.result.parameters.time && response.result.parameters.date1) {
                  time = response.result.parameters.time
                  date1 = response.result.parameters.date1
                  timeOffCase = 7

                }
                else if (response.result.parameters.date && response.result.parameters.date1) {
                  date = response.result.parameters.date
                  date1 = response.result.parameters.date1
                  timeOffCase = 8

                }
                else if (response.result.parameters.date) {
                  date = response.result.parameters.date
                  date1 = response.result.parameters.date
                  timeOffCase = 9

                }
                else if (response.result.parameters.time) {
                  time = response.result.parameters.time
                  timeOffCase = 10

                } else {
                  flag = 0
                }
                if (flag == 1) {
                  date1 = date1.replace(/-/g, "/")
                  date = date.replace(/-/g, "/")


                  if (vacation_type1 == "") {
                    vacation_type1 = "personal"
                  }
                  //get the milliseconds for the  end of the vacation 
                  hrHelper.convertTimeFormat(time, function (x, y, convertedTime) {
                    hrHelper.convertTimeFormat(time1, function (x, y, convertedTime1) {

                      var toDate = date1 + " " + convertedTime1
                      var fromDate = date + " " + convertedTime;
                      console.log("toDate::" + toDate);
                      console.log("fromDate::" + fromDate);
                      toDate = new Date(toDate);
                      var dateMilliSeconds = toDate.getTime();
                      dateMilliSeconds = dateMilliSeconds - (3 * 60 * 60 * 1000);


                      var timeMilliseconds = new Date(fromDate);
                      timeMilliseconds = timeMilliseconds.getTime();
                      timeMilliseconds = timeMilliseconds - (3 * 60 * 60 * 1000);
                      console.log("timeMilliseconds :::" + timeMilliseconds)
                      confirmationFunctions.sendVacationWithLeaveConfirmation(msg, convertedTime, date, convertedTime1, date1, timeMilliseconds, dateMilliSeconds, emailValue, generalEmail, vacation_type1, timeOffCase)
                      vacation_type1 = ""
                      generalEmail = ""

                    })

                  })

                } else msg.say("Error in request")

              }
            }
          })

        }
        else if (responseText == "showEmployeeInfo") {
          var employeeEmail = "";
          if (response.result.parameters.any) {
            employeeEmail = response.result.parameters.any + "@exalt.ps"
            employeeEmail = employeeEmail.replace(/ /g, ".");
            if (response.result.parameters.edit_syonymes) {
              var url = "http://172.30.204.243:9090/employee/" + employeeEmail + "/edit"
              msg.say(url)
            }

            else if (response.result.parameters.employee_info_types == "stats")
              employee.showEmployeeStats(emailValue, employeeEmail, msg);
            else if (response.result.parameters.employee_info_types == "profile")
              employee.showEmployeeProfile(emailValue, employeeEmail, msg)
            else employee.showEmployeeProfile(emailValue, employeeEmail, msg)



          }
          else if (response.result.parameters.email) {
            if ((response.result.parameters.email).indexOf('mailto') > -1) {
              employeeEmail = response.result.parameters.email
              employeeEmail = employeeEmail.toString().split('|')
              employeeEmail = employeeEmail[1];
              employeeEmail = employeeEmail.replace(/>/g, "");
              console.log("Email after split mail to ")
            }
            else employeeEmail = response.result.parameters.email


            if (response.result.parameters.edit_syonymes) {
              var url = "http://172.30.204.243:9090/employee/" + employeeEmail + "/edit"
              msg.say(url)
            }
            else if (response.result.parameters.employee_info_types == "stats")
              employee.showEmployeeStats(emailValue, employeeEmail, msg);
            else if (response.result.parameters.employee_info_types == "profile")
              employee.showEmployeeProfile(emailValue, employeeEmail, msg)
            else employee.showEmployeeProfile(emailValue, employeeEmail, msg)

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
  var fromtDate = arr[5]
  var toDate = arr[6]
  var type = arr[7]
  var typeText = " time off"
  if (type == "sick") {
    typeText = " sick time off "
  } else if (type == "Maternity") {
    typeText = " maternity" + " time off"
  } else if (type == "Paternity") {
    typeText = " paternity" + " time off"
  } else if (type == "WFH")
    typeText = " work from home"
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
    hrHelper.sendFeedBackMessage(responseBody, hrEmail, fromtDate, toDate)
    msg.say("You have accepted the" + typeText + " request for " + userEmail + " ( " + fromtDate + "-" + toDate + ").")


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
          "text": "Hi, you have granted " + numberOfExtraTimeOff + " extra " + type + " from the HR Admin.",
        }
        var stringfy = JSON.stringify(text12);
        var obj1 = JSON.parse(stringfy);
        bot.reply(message, obj1);

      }
    });
    msg.respond(msg.body.response_url, "You have added " + numberOfExtraTimeOff + " extra " + type + " for " + userEmail + ".")
  });
})


slapp.action('manager_confirm_reject', 'reject', (msg, value) => {
  var arr = value.toString().split(";")
  var userEmail = arr[0];
  var vacationId = arr[1];
  var approvalId = arr[2]
  var hrEmail = arr[3]
  var fromtDate = arr[5]
  var toDate = arr[6]
  var type = arr[7]
  var typeText = " time off"
  if (type == "sick") {
    typeText = " sick time off "
  } else if (type == "Maternity") {
    typeText = " maternity" + " time off"
  } else if (type == "Paternity") {
    typeText = " paternity" + " time off"
  } else if (type == "WFH")
    typeText = " work from home"
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
          "text": "HR " + hrEmail + " has rejected your time off request" + " ( " + fromtDate + "-" + toDate + " ).Sorry! ",
        }
        var stringfy = JSON.stringify(text12);
        var obj1 = JSON.parse(stringfy);
        bot.reply(message, obj1);
      }
    });
  });

  msg.say("you have rejected the" + typeText + "  request for " + userEmail)
})


slapp.action('manager_confirm_reject', 'dont_detuct', (msg, value) => {
  var arr = value.toString().split(";")
  var userEmail = arr[0];
  var vacationId = arr[1];
  var approvalId = arr[2]
  var hrEmail = arr[3]
  var fromtDate = arr[5]
  var toDate = arr[6]
  var type = arr[7]
  var typeText = " time off"
  if (type == "sick") {
    typeText = " sick time off "
  } else if (type == "Maternity") {
    typeText = " maternity" + " time off"
  } else if (type == "Paternity") {
    typeText = " paternity" + " time off"
  } else if (type == "WFH")
    typeText = " work from home"
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
          "text": "HR " + hrEmail + " has accepted your time off request without detuction" + " ( " + fromtDate + "-" + toDate + "). Enjoy!",
        }
        var stringfy = JSON.stringify(text12);
        var obj1 = JSON.parse(stringfy);
        bot.reply(message, obj1);

      }
    });
  });

  msg.say("you have accepted the" + typeText + " request but without detuction for " + userEmail + " ( " + fromtDate + "-" + toDate + ").")


})
//force vacation for employee
slapp.action('leave_with_vacation_confirm_reject', 'confirm', (msg, value) => {
  managerAction(msg, value, "Approved")
})
slapp.action('leave_with_vacation_confirm_reject', 'reject', (msg, value) => {
  msg.say("Ok, operation aborted.")
  fromDate = "";
  toDate = "";
})
function managerAction(msg, value, typeOfaction) {
  var arr = ""
  var type = ""
  var managerEmail = ""
  var fromDateInMilliseconds = ""
  var toDateInMilliseconds = ""
  var workingDays = ""

  var employeeEmail = ""
  var managerId = ""
  var fromDate = ""
  var toDate = ""
  arr = value.toString().split(",");
  type = arr[5]
  managerEmail = arr[2];
  fromDateInMilliseconds = arr[3];
  toDateInMilliseconds = arr[4]
  workingDays = arr[6]
  fromDate = arr[7]
  toDate = arr[8]
  employeeEmail = arr[9]
  managerId = arr[10]
  console.log("Freooooom" + fromDate)
  console.log("toDate", toDate)
  hrHelper.sendVacationPostRequest(/*from  */fromDateInMilliseconds, toDateInMilliseconds, "ss", employeeEmail, type, function (vacationId, managerApproval) {
    arr = value.toString().split(",");
    fromDate = arr[7]
    toDate = arr[8]
    employeeEmail = arr[9]
    managerId = arr[10]
    console.log("Freooooom" + fromDate)
    console.log("toDate", toDate)

    hrHelper.convertTimeFormat(arr[0], function (formattedTime, midday) {

      hrHelper.convertTimeFormat(arr[1], function (formattedTime1, midday1) {

        if (arr[0] && (arr[0] != undefined)) {
          fromDate = fromDate + " at " + formattedTime + " " + midday
        } else fromDate = fromDate + " at 08:00 am ";

        if (arr[1] && (arr[1] != undefined)) {
          toDate = toDate + " at " + formattedTime1 + " " + midday1
        } else toDate = toDate + " at 05:00 pm ";


        console.log("Freooooom" + fromDate)
        console.log("toDate", toDate)
        console.log("sent VacationPostRequest");
        var messageFB = "Your request ( " + fromDate + "-" + toDate + " ) for " + employeeEmail + " has been submitted and is awaiting your managers approval "

        var text12 = {
          "text": "Your request has been submitted",
          "attachments": [
            {
              "text": messageFB,
              "callback_id": 'cancel_request',
              "color": "#3AA3E3",
              "attachment_type": "default",
              "actions": [
                {
                  "name": 'cancel',
                  "text": "Cancel Request",
                  "style": "danger",
                  "type": "button",
                  "value": managerEmail + ";" + vacationId + ";" + JSON.stringify(managerApproval) + ";" + fromDate + ";" + toDate

                }
              ]
            }
          ]
        }
        console.log("cancel_request1" + JSON.stringify(managerApproval))

        msg.respond(msg.body.response_url, text12)

      });
    })
  })



      fromDate = "";
      toDate = "";
    }
slapp.action('cancel_request', 'cancel', (msg, value) => {
        var arr = value.toString().split(";")
        var email = arr[0]
        var vacationId = arr[1]
        var managerApproval = arr[2]
        var fromDate = arr[3]
        var toDate = arr[4]
        console.log("cancel_request" + JSON.stringify(managerApproval))
        hrHelper.getNewSessionwithCookie(email, function (remember_me_cookie, session_Id) {
          //get vacation state

        }, function (error, response, body) {

          //delete vacation request
          request({
            url: 'http://' + IP + '/api/v1/vacation/' + vacationId,
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': remember_me_cookie + ";" + session_Id
            },
          }, function (error, response, body) {
            msg.respond(msg.body.response_url, "Your request has been canceled")
          })
        })
      })

app.get('/', function (req, res) {

        res.send('Hello')
      })

console.log('Listening on :' + process.env.PORT)
app.listen(process.env.PORT)
