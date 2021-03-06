'use strict'
const env = require('./public/configrations.js')



var vacationHelper = require("./public/Vacation.js")
var replaceMessage = require('./messagesHelper/replaceManagerActionMessage.js')
const confirmationFunctions = require('./ConfirmationMessages/confirmationFunctions.js')
const messageSender = require('./ConfirmationMessages/messageSender.js')
var employee = require('./employeeSide.js')
const apiAiService = env.apiai(env.APIAI_ACCESS_TOKEN);
var pg = require('pg');

var SLACK_ACCESS_TOKEN = process.env.SLACK_APP_ACCESS_KEY;
var SLACK_BOT_TOKEN = process.env.SLACK_BOT_ACCESS_KEY;
var fs = require('fs');
var userId = ""
var employeeChannel = "";
var managerChannel = "D3RR2RE68"
var generalEmail = ""
var vacation_type1 = ""

function storeHrSlackInformation(email, msg) {
  env.mRequests.getSlackRecord(email, function (error, response, body) {

    if (response.statusCode == 404) {
      console.log("the employee  not found ")
      env.requestify.post('http://' + env.IP + '/api/v1/toffy', {
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

      if (((JSON.parse(body)).hrChannelId) != (msg.body.event.channel)) {

        var userChId = JSON.parse(body).userChannelId;
        var managerChId = JSON.parse(body).managerChannelId;
        env.requestify.post('http://' + env.IP + '/api/v1/toffy', {
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
  env.hrHelper.getRoleByEmail(emailValue, "HR_ADMIN", function (role) {
    console.log("role" + role)
    if (role == true) {
      storeHrSlackInformation(emailValue, msg);

      var text = msg.body.event.text;
      let apiaiRequest = apiAiService.textRequest(text,
        {
          sessionId: env.sessionId
        });

      apiaiRequest.on('response', (response) => {
        let responseText = response.result.fulfillment.speech;
        if (responseText == "vacationWithLeave") {
          var messageText = ""
          var employeeEmail = ""
          env.hrHelper.getTodayDate(function (today) {
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
                  env.hrHelper.convertTimeFormat(time, function (x, y, convertedTime) {
                    env.hrHelper.convertTimeFormat(time1, function (x, y, convertedTime1) {

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
            else if (response.result.parameters.employee_info_types == "history")
              employee.showEmployeeHistory(emailValue, employeeEmail, msg)
            else employee.showEmployeeProfile(emailValue, employeeEmail, msg)



          }
          else if (response.result.parameters.email) {
            if ((response.result.parameters.email).indexOf('mailto') > -1) {
              employeeEmail = response.result.parameters.email
              employeeEmail = employeeEmail.toString().split('|')
              employeeEmail = employeeEmail[1];
              employeeEmail = employeeEmail.replace(/>/g, "");
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
            else if (response.result.parameters.employee_info_types == "history")
              employee.showEmployeeHistory(emailValue, employeeEmail, msg)
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
          env.hrHelper.showEmployeesBalance(msg, emailValue, number, quantity_Type, period_types)

        }

        else msg.say(responseText);


      });
      apiaiRequest.on('error', (error) => console.error(error));
      apiaiRequest.end();
    } else if (role == 1000) {
      msg.say(env.stringFile.deactivated_message)
    } else msg.say(env.stringFile.permession_denied_message)
  })

}
//get the email of the sender by request slack Api and compare Ids to get the email of mapped ID
function getMembersList(Id, msg) {
  var emailValue = ""
  env.mRequests.getSlackMembers(function (error, response, body) {



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

        i++;
      }
    }
  });
}
/*--------------___________________________________________________----------------------
    listen for hr messages 
     -------------____________________________________________________---------------------
     */

var app = env.slapp.attachToExpress(env.express())
env.slapp.message('(.*)', ['direct_message'], (msg, text, match1) => {
  console.log("The messag:" + JSON.stringify(msg))
  if (msg.body.event.user == "U5T1HTURF") {


  } else {


    var stringfy = JSON.stringify(msg);
    getMembersList(msg.body.event.user, msg)
  }
})
/*--------------___________________________________________________----------------------
space
-------------____________________________________________________---------------------
*/
/**
 * 
 * 
 * 
 */
function managerApproval1(msg, value, approvalType, fromManager, comment, rejectConfFlag, sickReportFlag) {
  var pastflag = 0
  var upload_sick_report_message = "";
  var feedback_message_to_emp = ""
  var arr = value.toString().split(";")
  var userEmail = arr[0];
  var vacationId = arr[1];
  var approvalId = arr[2]
  var managerEmail = arr[3]
  var fromWho = arr[4];
  var fromDate = arr[5];
  var toDate = arr[6];
  var type = arr[7]
  var workingDays = arr[8]
  var ImageUrl = arr[9]
  console.log("ImageUrl" + ImageUrl)
  var typeText = " time off"
  if (type == "sick") {
    typeText = " sick time off "
  } else if (type == "Maternity") {
    typeText = " maternity" + " time off"
  } else if (type == "Paternity") {
    typeText = " paternity" + " time off"
  } else if (type == "WFH")
    typeText = " work from home"
  env.mRequests.getVacationInfo(managerEmail, vacationId, function (error, response, vacationBody) {
    var attachment_url = JSON.parse(vacationBody).attachments[0].reference
    var currentMilliseconds = new Date().getTime();
    if (currentMilliseconds > JSON.parse(vacationBody).fromDate)
      pastflag = 1
    //check if the vaction rejected in order to prevent manager to take an action
    if (JSON.parse(vacationBody).sickCovertedToPersonal == true) {
      replaceMessage.replaceAlreadyRejectedVacation(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)
    }
    else {


      env.messageGenerator.generateManagerApprovelsSection(JSON.parse(vacationBody).managerApproval, managerEmail, JSON.parse(vacationBody).needsSickReport, function (managerApprovalsSection) {


        if (approvalType == "Rejected" && pastflag == 1 && rejectConfFlag == 0) {
          replaceMessage.replaceRejectedConfirmation(msg, userEmail, managerEmail, fromDate, toDate, type, "Pending", vacationId, approvalId, ImageUrl, typeText, workingDays, managerApprovalsSection, JSON.parse(vacationBody).vacationState, JSON.parse(vacationBody).comments)
        } else {


          env.hrHelper.sendVacationPutRequest(vacationId, approvalId, managerEmail, approvalType)

          env.mRequests.getVacationInfo(managerEmail, vacationId, function (error, response, vacationBody1) {
            attachment_url = JSON.parse(vacationBody).attachments[0].reference
            //if (JSON.parse(vacationBody1).vacationState == "Approved")
            var existReportFlag = JSON.parse(vacationBody1).needsSickReport
            env.messageGenerator.generateManagerApprovelsSection(JSON.parse(vacationBody1).managerApproval, managerEmail, existReportFlag, function (managerApprovalsSection1) {


              env.mRequests.getSlackRecord(userEmail, function (error, response, body) {
                var responseBody = JSON.parse(body);
                var slack_message = env.stringFile.slack_message(responseBody.userChannelId, responseBody.slackUserId, responseBody.teamId)

                if ((JSON.parse(vacationBody1).vacationState == "Approved") || (JSON.parse(vacationBody1).vacationState == "Rejected") || JSON.parse(vacationBody1).vacationState == "ApprovedWithoutDeduction")
                  env.hrHelper.sendFeedBackMessage(responseBody, managerEmail, fromDate, toDate, approvalType, comment)


                if (approvalType == "Rejected" && rejectConfFlag == 1) {
                  replaceMessage.replaceAlreadyRejectedVacation(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)

                } else


                  replaceMessage.replaceMessage(msg, userEmail, managerEmail, fromDate, toDate, type, approvalType, vacationId, approvalId, ImageUrl, typeText, workingDays, managerApprovalsSection1, JSON.parse(vacationBody1).vacationState, JSON.parse(vacationBody1).comments, attachment_url)
                /* if (comment != "accept_with_report")
                   messageSender.sendMessagetoEmpOnAction(msg, managerEmail, fromDate, toDate, userEmail, type, bot, approvalType, body, typeText, responseBody, comment);
 */




              })
            })
          })
        }
      })
    }
  })
}
function AddCompensationTimeOff(msg, value, comment) {
  var commentSection = ""
  if (comment != "") {
    commentSection = "HR comment: " + comment + "."
  }
  var arr = value.toString().split(",")
  var hrEmail = arr[0];
  var userEmail = arr[1];
  var numberOfExtraTimeOff = arr[2];
  var type = arr[3]
  var unit = ""
  if (type == "week" || type == "weeks")
    unit = 0
  if (type == "day" || type == "days")
    unit = 1
  if (type == "hour" || type == "hours")
    unit = 2

  //hrHelper.sendVacationPutRequest(vacationId, approvalId, hrEmail, "Approved")
  env.mRequests.getSlackRecord(userEmail, function (error, response, body) {
    var responseBody = JSON.parse(body);
    var slack_message = env.stringFile.slack_message(responseBody.userChannelId, responseBody.slackUserId, responseBody.teamId)
    env.mRequests.addCompenstaion(hrEmail, userEmail, numberOfExtraTimeOff, unit, comment, function (error, response, body) {

      var managerChannelId = JSON.parse(body).managerInfo.managerChannelId
      var managerSlackId = JSON.parse(body).managerInfo.slackUserId
      var teamId = JSON.parse(body).managerInfo.teamId
      var manager_slack_message = env.stringFile.slack_message(managerChannelId, managerSlackId, responseBody.teamId)


      env.bot.startConversation(slack_message, function (err, convo) {

        if (!err) {
          var text12 = {
            "text": "Hi, you have granted " + numberOfExtraTimeOff + " extra " + type + " from the HR Admin.\n " + commentSection,
          }
          var stringfy = JSON.stringify(text12);
          var obj1 = JSON.parse(stringfy);
          env.bot.reply(slack_message, obj1);

        }
      });
      env.managerBot.startConversation(manager_slack_message, function (err, convo) {

        if (!err) {
          var text12 = {
            "text": "Hi, " + userEmail + " have granted " + numberOfExtraTimeOff + " extra " + type + " from the HR Admin.\n " + commentSection,
          }
          var stringfy = JSON.stringify(text12);
          var obj1 = JSON.parse(stringfy);
          env.managerBot.reply(manager_slack_message, obj1);

        }
      });
      msg.respond(msg.body.response_url, "You have added " + numberOfExtraTimeOff + " extra " + type + " for " + userEmail + ".")
    })
  });
}

env.slapp.action('manager_confirm_reject', 'confirm', (msg, value) => {
  managerApproval1(msg, value, "Approved", "", "", 0, 0)
})

env.slapp.action('confirm_reject_compensation', 'confirm', (msg, value) => {
  //
  AddCompensationTimeOff(msg, value, "")

})
env.slapp.action('confirm_reject_compensation', 'reject', (msg, value) => {
  //
  msg.respond(msg.body.response_url, "Ok operation aborted.")

})
env.slapp.action('confirm_reject_compensation', 'Yeswithcomment', (msg, value) => {
  var arr = value.toString().split(",")
  var hrEmail = arr[0];
  var userEmail = arr[1];
  var numberOfExtraTimeOff = arr[2];
  var type = arr[3]
  var unit = ""
  var message = env.stringFile.Compensation_Coment(hrEmail, userEmail, numberOfExtraTimeOff, type)
  msg.respond(msg.body.response_url, message)

})
env.slapp.action('confirm_reject_compensation', 'CompenstationComment', (msg, value) => {
  //Yeswithcomment
  var arr = value.toString().split(",")
  var commemt = arr[4];
  AddCompensationTimeOff(msg, value, commemt)


})
env.slapp.action('confirm_reject_compensation', 'CompensationBack', (msg, value) => {
  var arr = value.toString().split(",")
  var hrEmail = arr[0];
  var userEmail = arr[1];
  var numberOfExtraTimeOff = arr[2];
  var type = arr[3]
  var message = env.stringFile.Compensation_Confirmation_message(hrEmail, userEmail, numberOfExtraTimeOff, type)
  msg.respond(msg.body.response_url, message)

  //Yeswithcomment 
  //AddCompensationTimeOff(msg, value, "")


})
//CompensationBack



env.slapp.action('manager_confirm_reject', 'reject', (msg, value) => {
  managerApproval1(msg, value, "Rejected", "", "", 0, 0)

})

/**
 * 
 * Check state
 */
env.slapp.action('manager_confirm_reject', 'check_state', (msg, value) => {
  console.log("Check state")
  var arr = value.toString().split(";")
  var userEmail = arr[0];
  var vacationId = arr[1];
  var approvalId = arr[2]
  var managerEmail = arr[3]
  var fromWho = arr[4];
  var fromDate = arr[5];
  var toDate = arr[6];
  var type = arr[7]
  var workingDays = arr[8]
  var ImageUrl = arr[9]
  env.mRequests.getVacationInfo(managerEmail, vacationId, function (error, response, body) {
    if (response.statusCode == 404) {
      replaceMessage.replaceCanceledRequestOnAction(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)
    } else if (response.statusCode == 200) {
      if (JSON.parse(body).sickCovertedToPersonal == true) {
        replaceMessage.replaceAlreadyRejectedVacation(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)
      } else {
        var attachment_url = JSON.parse(body).attachments[0].reference

        // replaceMessage.replaceMessageOnCheckState(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)
        env.messageGenerator.generateManagerApprovelsSection(JSON.parse(body).managerApproval, managerEmail, JSON.parse(body).needsSickReport, function (managerApprovalsSection) {
          vacationHelper.getSecondApproverStateAndFinalState(managerEmail, body, 1, function (myEmail, myAction, vacationState) {
            replaceMessage.replaceMessageOnCheckState(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays, managerApprovalsSection, vacationState, myAction, JSON.parse(body).comments, attachment_url)

          })
        })
      }
    }
  })
})

//force vacation for employee
env.slapp.action('leave_with_vacation_confirm_reject', 'confirm', (msg, value) => {
  managerAction(msg, value, "Approved")
})
env.slapp.action('leave_with_vacation_confirm_reject', 'reject', (msg, value) => {
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

  env.hrHelper.sendVacationPostRequest(/*from  */fromDateInMilliseconds, toDateInMilliseconds, "ss", employeeEmail, type, function (vacationId, managerApproval) {
    arr = value.toString().split(",");
    fromDate = arr[7]
    toDate = arr[8]
    employeeEmail = arr[9]
    managerId = arr[10]


    env.hrHelper.convertTimeFormat(arr[0], function (formattedTime, midday) {

      env.hrHelper.convertTimeFormat(arr[1], function (formattedTime1, midday1) {

        if (arr[0] && (arr[0] != undefined)) {
          fromDate = fromDate + " at " + formattedTime + " " + midday
        } else fromDate = fromDate + " at 08:00 am ";

        if (arr[1] && (arr[1] != undefined)) {
          toDate = toDate + " at " + formattedTime1 + " " + midday1
        } else toDate = toDate + " at 05:00 pm ";



        var messageFB = "Your request ( " + fromDate + "-" + toDate + " ) for " + employeeEmail + " has been submitted ."

        var text12 = {
          "text": "",
          "attachments": [
            {
              "text": messageFB,
              "callback_id": 'cancel_request',
              "color": "#3AA3E3",
              "attachment_type": "defaul  t",
              "actions": [
                {
                  "name": 'cancel',
                  "text": "Cancel Request",
                  "style": "danger",
                  "type": "button",
                  "value": managerEmail + ";" + vacationId + ";" + fromDate + ";" + toDate + ";" + employeeEmail

                }
              ]
            }
          ]
        }

        msg.respond(msg.body.response_url, text12)
        messageSender.sendMessageSpecEmployee(employeeEmail, "Hi, HR " + managerEmail + " has posted a time off for you from " + fromDate + "-" + toDate + ".");

      });
    })
  })



  fromDate = "";
  toDate = "";
}
/**
 * 
 * 
 * 
 * 
 */
env.slapp.action('manager_confirm_reject', 'Undo', (msg, value) => {
  var arr = value.toString().split(";")
  console.log("UNDO UNDO")
  var userEmail = arr[0];
  var vacationId = arr[1];
  var approvalId = arr[2]
  var managerEmail = arr[3]
  var fromWho = arr[4];
  var fromDate = arr[5];
  var toDate = arr[6];
  var type = arr[7]
  var workingDays = arr[8]
  var ImageUrl = arr[9]

  env.mRequests.getVacationInfo(managerEmail, vacationId, function (error, response, body) {
    if (JSON.parse(body).sickCovertedToPersonal == true) {
      replaceMessage.replaceAlreadyRejectedVacation(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)
    } else {
      var attachment_url = JSON.parse(body).attachments[0].reference
      console.log("generate attachment_url " + JSON.stringify(body))
      env.messageGenerator.generateManagerApprovelsSection(JSON.parse(body).managerApproval, managerEmail, JSON.parse(body).needsSickReport, function (managerApprovalsSection) {

        vacationHelper.getSecondApproverStateAndFinalState(managerEmail, body, 1, function (myEmail, myAction, vacationState) {
          replaceMessage.undoAction(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays, managerApprovalsSection, vacationState, myAction, JSON.parse(body).comments, attachment_url)
        })


      })
    }
  })

})
/**
 * 
 * Undo on checj state
 */
env.slapp.action('manager_confirm_reject', 'check_state_undo', (msg, value) => {
  var arr = value.toString().split(";")
  var userEmail = arr[0];
  var vacationId = arr[1];
  var approvalId = arr[2]
  var managerEmail = arr[3]
  var fromWho = arr[4];
  var fromDate = arr[5];
  var toDate = arr[6];
  var type = arr[7]
  var workingDays = arr[8]
  var ImageUrl = arr[9]
  env.mRequests.getVacationInfo(managerEmail, vacationId, function (error, response, body) {
    if (response.statusCode == 404) {
      replaceMessage.replaceCanceledRequestOnAction(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)
    } else if (response.statusCode == 200) {
      if (JSON.parse(body).sickCovertedToPersonal == true) {
        replaceMessage.replaceAlreadyRejectedVacation(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)
      } else {
        var attachment_url = JSON.parse(body).attachments[0].reference
        // replaceMessage.replaceMessageOnCheckState(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)
        env.messageGenerator.generateManagerApprovelsSection(JSON.parse(body).managerApproval, managerEmail, JSON.parse(body).needsSickReport, function (managerApprovalsSection) {
          vacationHelper.getSecondApproverStateAndFinalState(managerEmail, body, 1, function (myEmail, myAction, vacationState) {
            replaceMessage.replaceMessage(msg, userEmail, managerEmail, fromDate, toDate, type, myAction, vacationId, approvalId, ImageUrl, "", workingDays, managerApprovalsSection, vacationState, JSON.parse(body).comments, attachment_url)

          })
        })
      }
    }
  })
})
/**
 * Reject with commemt listener
 * 
 */
env.slapp.action('manager_confirm_reject', 'reject_with_comment', (msg, value) => {
  var arr = value.toString().split(";")
  var userEmail = arr[0];
  var vacationId = arr[1];
  var approvalId = arr[2]
  var managerEmail = arr[3]
  var fromWho = arr[4];
  var fromDate = arr[5];
  var toDate = arr[6];
  var type = arr[7]
  var workingDays = arr[8]
  var ImageUrl = arr[9]
  env.mRequests.getVacationInfo(managerEmail, vacationId, function (error, response, body) {
    vacationHelper.getSecondApproverStateAndFinalState(managerEmail, body, 1, function (myEmail, myAction, vacationState) {
      if (JSON.parse(body).sickCovertedToPersonal == true) {
        replaceMessage.replaceAlreadyRejectedVacation(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays)
      } else {
        var attachment_url = JSON.parse(body).attachments[0].reference

        env.messageGenerator.generateManagerApprovelsSection(JSON.parse(body).managerApproval, managerEmail, JSON.parse(body).needsSickReport, function (managerApprovalsSection) {

          replaceMessage.replaceWithComment(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays, managerApprovalsSection, vacationState, myAction, JSON.parse(body).comments, attachment_url)
        })
      }
    })
  })
})
env.slapp.action('manager_confirm_reject', 'Send_comment', (msg, value) => {
  var arr = value.toString().split(";")
  var comment = arr[10]

  managerApproval1(msg, value, "Rejected", "", comment, 0, 0)
})
env.slapp.action('cancel_request', 'cancel', (msg, value) => {
  var arr = value.toString().split(";")
  var email = arr[0]
  var vacationId = arr[1]

  var fromDate = arr[2]
  var toDate = arr[3]
  var employeeEmail = arr[4]
  env.mRequests.deleteVacation(email, vacationId, function (error, response, body) {
    msg.respond(msg.body.response_url, "Your request for " + employeeEmail + " ( " + fromDate + "-" + toDate + " ) has been canceled")
    messageSender.sendMessageSpecEmployee(employeeEmail, "Hi, HR " + email + " has canceled a time off for you ( " + fromDate + "-" + toDate + " ).Sorry!")
  })
})
/**
 * 
 * 
 * 
 */
env.slapp.action('manager_confirm_reject', 'Rejected_Conf', (msg, value) => {
  var arr = value.toString().split(";")
  var comment = arr[10]
  managerApproval1(msg, value, "Rejected", 0, comment, 1, 0)


})
/**
 * 
 * 
 * 
 */

app.get('/', function (req, res) {

  res.send('Hello')
})

console.log('Listening on :' + process.env.PORT)
app.listen(process.env.PORT)
