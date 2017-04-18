const request = require('request');
var hrHelper = require('.././HrHelper.js')
var server = require('.././server.js')
var sessionFlag = 0;
var generalCookies = "initial"
var IP = process.env.SLACK_IP
module.exports.sendVacationWithLeaveConfirmation = function sendLeaveSpecTimeSpecDayConfirmation(msg, fromTime, fromDate, toTime, ToDate, fromMilliseconds, toMilliseconds, email, employeeEmail, type, timeOffcase) {
    console.log("sendVacationWithLeaveConfirmation ")
    console.log("fromDate " + fromDate)
    console.log("fromTime " + fromTime)
    console.log("toTime " + toTime)
    console.log("ToDate " + ToDate)
    console.log("fromMilliseconds " + fromMilliseconds)
    console.log("toMilliseconds " + toMilliseconds)
    console.log("employeeEmail" + employeeEmail)
    var typeNum = ""
    if (type == "sick")
        typeNum = 4
    else typeNum = 0
    hrHelper.convertTimeFormat(fromTime, function (formattedFromTime, middayFrom, TimeforMilliseconds) {
        hrHelper.convertTimeFormat(toTime, function (formattedTime, midday, TimeforMilliseconds1) {
            getWorkingDays(fromMilliseconds, toMilliseconds, email, employeeEmail, typeNum, function (body) {
                var workingDays = parseFloat(body).toFixed(1);

                getmessage(formattedFromTime, middayFrom, fromDate, formattedTime, midday, ToDate, email, employeeEmail, type, timeOffcase, workingDays, function (messagetext) {
                    getIdByEmail(email, function (Id) {


                        if (type == "sick") {
                            msg.say("Sorry to hear that :(")
                        }

                        var text12 = {
                            "text": "",
                            "attachments": [
                                {
                                    "text": messagetext,
                                    "callback_id": 'leave_with_vacation_confirm_reject',
                                    "color": "#3AA3E3",
                                    "attachment_type": "default",
                                    "actions": [
                                        {
                                            "name": 'confirm',
                                            "text": "Yes      ",
                                            "style": "primary",
                                            "type": "button",
                                            "value": fromTime + "," + toTime + "," + email + "," + fromMilliseconds + "," + toMilliseconds + "," + type + "," + workingDays + "," + fromDate + "," + ToDate + "," + employeeEmail + "," + Id
                                        },
                                        {
                                            "name": 'reject',
                                            "text": "No      ",
                                            "style": "danger",
                                            "type": "button",
                                            "value": fromTime + "," + toTime + "," + email + "," + fromMilliseconds + "," + toMilliseconds + "," + type + "," + workingDays + "," + fromDate + "," + ToDate + "," + employeeEmail + "," + Id
                                        }
                                        ,
                                        {
                                            "name": 'confirm_without_detuction',
                                            "text": "don't detuct",
                                            "style": "good",
                                            "type": "button",
                                            "value": fromTime + "," + toTime + "," + email + "," + fromMilliseconds + "," + toMilliseconds + "," + type + "," + workingDays + "," + fromDate + "," + ToDate + "," + employeeEmail + "," + Id
                                        }
                                    ]
                                }
                            ]
                        }
                        msg.say(text12)
                    })
                })
            });
        })
    })
}
function getWorkingDays(startDate, endDate, email, employeeEmail, typeNum, callback) {
    hrHelper.getIdFromEmail(email, employeeEmail, function (Id) {
        var vacationBody = {
            "employee_id": Id,
            "from": startDate,
            "to": endDate,
            "type": typeNum

        }
        vacationBody = JSON.stringify(vacationBody)

        hrHelper.getNewSessionwithCookie(email, function (cookies, session_Id) {
            request({
                url: "http://" + IP + "/api/v1/vacation/working-days", //URL to hitDs
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': cookies + ";" + session_Id
                },
                body: vacationBody
                //Set the body as a stringcc
            }, function (error, response, body) {
                console.log(" getWorkingDays" + response.statusCode)
                console.log("getWorkingDays" + body);
                console.log("getWorkingDays" + JSON.stringify(body));
                callback((JSON.parse(body)).workingPeriod)
            })

        })
    })
}

function getmessage(formattedFromTime, middayFrom, fromDate, formattedTime, midday, ToDate, email, employeeEmail, type, timeOffcase, workingDays, callback) {
    var typeText = ""
    if (type == "sick") {
        typeText = " sick"
    }
    var messageText = ""
    if (timeOffcase == 1) {
        messageText = "Okay, you asked for a" + typeText + " time off for " + employeeEmail + " on " + fromDate + "  at, " + formattedFromTime + " " + middayFrom + "" + " to " + ToDate + " at " + formattedTime + " " + midday + " and that would be " + workingDays + " working days" + ". Should I go ahead ?"
    } else if (timeOffcase == 2) {
        messageText = "Okay, you asked for a" + typeText + " time off for " + employeeEmail + " from, " + formattedFromTime + " " + middayFrom + "" + " to " + formattedTime + " " + midday + " on " + ToDate + " and that would be " + workingDays + " working days" + ". Should I go ahead ?"

    } else if (timeOffcase == 3) {
        messageText = "Okay, you asked for a" + typeText + " time off for" + employeeEmail + " from, " + formattedFromTime + " " + middayFrom + "" + " to " + formattedTime + " " + midday + " at " + fromDate + " and that would be " + workingDays + " working days" + ". Should I go ahead ?"

    } else if (timeOffcase == 4) {
        messageText = "Okay, you asked for a" + typeText + " time off for " + employeeEmail + " on, " + fromDate + " at " + formattedFromTime + " " + middayFrom + " to the end of" + fromDate + ", and that would be " + workingDays + " working days" + ". Should I go ahead ?"


    } else if (timeOffcase == 5) {
        messageText = "Okay, you asked for a" + typeText + " time off for " + employeeEmail + " from, " + formattedFromTime + " " + middayFrom + " to " + formattedTime + " " + midday + " today and that would be " + workingDays + " working days" + ". Should I go ahead ?"

    } else if (timeOffcase == 6) {
        messageText = "Okay, you asked for a " + typeText + "time off for  " + employeeEmail + " at " + formattedFromTime + " " + middayFrom + " to 5:00: pm on " + fromDate + ", and that would be " + workingDays + " working days" + ". Should I go ahead ?"

    } else if (timeOffcase == 7) {
        messageText = "Okay, you asked for a " + typeText + "time off for " + employeeEmail + " on " + fromDate + "  at " + formattedFromTime + " " + middayFrom + "" + " to " + ToDate + " at " + formattedTime + " " + midday + " and that would be " + workingDays + " working days" + ". Should I go ahead ?"


    } else if (timeOffcase == 8) {
        messageText = "Okay, you asked for a" + typeText + " time off for " + employeeEmail + " from  " + fromDate + " to " + ToDate + " and that would be " + workingDays + " working days" + ". Should I go ahead ?"


    } else if (timeOffcase == 9) {
        messageText = "Okay, you asked for a" + typeText + " time off for  " + employeeEmail + " on " + fromDate + " and that would be 1 working day. Should I go ahead ? "


    } else if (timeOffcase == 10) {
        messageText = "Okay, you asked for a" + typeText + " time off  for " + employeeEmail + " from, " + formattedFromTime + " " + middayFrom + "" + " to the end of the day," + " and that would be " + workingDays + " working days" + ". Should I go ahead ?"


    } else if (timeOffcase == 11) {

    } else if (timeOffcase == 12) {

    }
    callback(messageText)

}
function getIdByEmail(email, callback) {

    makePostRequest('employee/get-id', email, function (response, body) {
        console.log("body:" + body)
        callback(body)
    })

}
function makePostRequest(path, email, callback) {
    hrHelper.getNewSessionwithCookie(email, function (remember_me_cookie, session_Id) {
        var uri = 'http://' + IP + '/api/v1/' + path
        hrHelper.general_remember_me = remember_me_cookie;
        hrHelper.general_session_Id = session_Id;
        console.log("uri " + uri)
        request({
            url: uri, //URL to hitDs
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': remember_me_cookie + ";" + session_Id

            },
            body: email
            //Set the body as a stringcc
        }, function (error, response, body) {
            callback(response, body)
        })
    })

}