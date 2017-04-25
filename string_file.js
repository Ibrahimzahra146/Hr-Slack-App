

const SLACK_MEMBERS_LIST_URL = "https://slack.com/api/users.list?token=";
exports.SLACK_MEMBERS_LIST_URL = SLACK_MEMBERS_LIST_URL;

const SLACK_USER_INFO_URL = "https://slack.com/api/users.info?token=";
exports.SLACK_USER_INFO_URL = SLACK_USER_INFO_URL;

const CLIENT_ID = '3MVG9HxRZv05HarRwahdcdooErBOoQcBqIyghM1uhSz5nqz4b66MpGNzzd7k2bV1I3WHHaEwOSeyNaeB2KuN6';
exports.CLIENT_ID = CLIENT_ID;

const CLIENT_SECRET = '7906489004897348037';
exports.CLIENT_SECRET = CLIENT_SECRET;

//****************************************************************************************************************************************************************************
/*********************************************************************************************************************************************************************************/
/*msg.say in server */
/*PARAMETERS WITHOUT ATTRIBUTES*/
const SICK_OR_PERSONAL_VACATION = "Sick or personal vacation ?";
exports.SICK_OR_PERSONAL_VACATION = SICK_OR_PERSONAL_VACATION;

const SORRY_TO_HEAR_SICK__WHICH_DAYS = "Sorry to hear that. What days were you sick?";
exports.SORRY_TO_HEAR_SICK__WHICH_DAYS = SORRY_TO_HEAR_SICK__WHICH_DAYS;

const WHAT_ARE_THE_DATES = "what are the dates?";
exports.WHAT_ARE_THE_DATES = WHAT_ARE_THE_DATES;

const SPECIFY_DAY_TIME = "Please specify the day and time ";
exports.SPECIFY_DAY_TIME = SPECIFY_DAY_TIME;

const WILL_REQUEST_VACATION = "I will request a vacation for you";
exports.WILL_REQUEST_VACATION = WILL_REQUEST_VACATION;

const CANNOT_UNDERSTAND = "I cant understand you";
exports.CANNOT_UNDERSTAND = CANNOT_UNDERSTAND;

const NOT_LOGGED__VISIT_URL_TO_LOGIN_SALESFORCE = "You are not logged in, please visit this URL to login to Sales Force";
exports.NOT_LOGGED__VISIT_URL_TO_LOGIN_SALESFORCE = NOT_LOGGED__VISIT_URL_TO_LOGIN_SALESFORCE;

const URL_SALESFORCE = "https://login.salesforce.com/services/oauth2/authorize?client_id=3MVG9HxRZv05HarRwahdcdooErBOoQcBqIyghM1uhSz5nqz4b66MpGNzzd7k2bV1I3WHHaEwOSeyNaeB2KuN6&response_type=code&redirect_uri=https://beepboophq.com/proxy/b1bddd9741944d5d9298c7c37691b6d4/newteam";
exports.URL_SALESFORCE = URL_SALESFORCE;

const DONT_HAVE_ANY_MANAGER = "You dont have any manager right now ";
exports.DONT_HAVE_ANY_MANAGER = DONT_HAVE_ANY_MANAGER;

const OK_REQUEST_ABORTED = "Ok,request aborted";
exports.OK_REQUEST_ABORTED = OK_REQUEST_ABORTED;

const LEAVE_REQUEST_SUBMITTED_TO_MANAGERS = "Your leave request have been submitted to your managers.";
exports.LEAVE_REQUEST_SUBMITTED_TO_MANAGERS = LEAVE_REQUEST_SUBMITTED_TO_MANAGERS;
/*********************************************************************************************************************************************************************************/
/*msg.say in toffyHelper */
/*PARAMETERS WITHOUT ATTRIBUTES*/
const NO_HOLIIDAY_SORRY = "There are no holidays, sorry!";
exports.NO_HOLIIDAY_SORRY = NO_HOLIIDAY_SORRY;
/*********************************************************************************************************************************************************************************/
/*msg.say in employee  */
/*PARAMETERS WITHOUT ATTRIBUTES*/
const NO_REQUEST_VACATION = "There are no requested vacations for you";
exports.NO_REQUEST_VACATION = NO_REQUEST_VACATION;
/*********************************************************************************************************************************************************************************/
/*********************************************************************************************************************************************************************************/
/*********************************************************************************************************************************************************************************/
/*leave.js*/
/*CONSTANT PARAMETERS WITHOUT VARIABLES*/
const SORRY_TO_HEAR_THAT = "Sorry to hear that :(";
exports.SORRY_TO_HEAR_THAT = SORRY_TO_HEAR_THAT;
/*CONSTANT PARAMETERS WITH VARIABLES*/
// IN FUNCTION : function getmessage(formattedFromTime, middayFrom, fromDate, formattedTime, midday, ToDate, email, type, timeOffcase, workingDays, callback) -->>
//case1
module.exports.timeOffcase1 = function timeOffcase1(typeText, fromDate, formattedFromTime, middayFrom, ToDate, formattedTime, midday, workingDays) {
    var messageText = "Okay, you asked for a" + typeText + " time off on " + fromDate + "  at, " + formattedFromTime + " " + middayFrom + "" + " to " + ToDate + " at " + formattedTime + " " + midday + " and that would be " + workingDays + " working days" + ". Should I go ahead ?"
    return messageText;
}
//case2
module.exports.timeOffcase2 = function timeOffcase2(typeText, formattedFromTime, middayFrom, formattedTime, midday, ToDate, workingDays) {
    var messageText = "Okay, you asked for a" + typeText + " time off from, " + formattedFromTime + " " + middayFrom + "" + " to " + formattedTime + " " + midday + " on " + ToDate + " and that would be " + workingDays + " working days" + ". Should I go ahead ?"
    return messageText;
}
//case3
module.exports.timeOffcase3 = function timeOffcase3(typeText, formattedFromTime, middayFrom, formattedTime, midday, fromDate, workingDays) {
    var messageText = "Okay, you asked for a" + typeText + " time off from, " + formattedFromTime + " " + middayFrom + "" + " to " + formattedTime + " " + midday + " at " + fromDate + " and that would be " + workingDays + " working days" + ". Should I go ahead ?"
    return messageText;

}
//case4
module.exports.timeOffcase4 = function timeOffcase4(typeText, fromDate, formattedFromTime, middayFrom, formattedTime, midday, workingDays) {
    var messageText = "Okay, you asked for a" + typeText + " time off on, " + fromDate + " at " + formattedFromTime + " " + middayFrom + " to the end of" + fromDate + ", and that would be " + workingDays + " working days" + ". Should I go ahead ?"
    return messageText;

}
//case5
module.exports.timeOffcase5 = function timeOffcase5(typeText, formattedFromTime, middayFrom, formattedTime, midday, workingDays) {
    var messageText = "Okay, you asked for a" + typeText + " time off from, " + formattedFromTime + " " + middayFrom + " to " + formattedTime + " " + midday + " todaym and that would be " + workingDays + " working days" + ". Should I go ahead ?"
    return messageText;
}
//case6
module.exports.timeOffcase6 = function timeOffcase6(typeText, formattedFromTime, middayFrom, fromDate, workingDays) {
    var messageText = "Okay, you asked for a " + typeText + "time off at " + formattedFromTime + " " + middayFrom + " to 5:00: pm on " + fromDate + ", and that would be " + workingDays + " working days" + ". Should I go ahead ?"
    return messageText;
}
//case7
module.exports.timeOffcase7 = function timeOffcase7(typeText, fromDate, formattedFromTime, middayFrom, ToDate, formattedTime, midday, workingDays) {
    var messageText = "Okay, you asked for a " + typeText + "time off on " + fromDate + "  at " + formattedFromTime + " " + middayFrom + "" + " to " + ToDate + " at " + formattedTime + " " + midday + " and that would be " + workingDays + " working days" + ". Should I go ahead ?"
    return messageText;
}
//case8
module.exports.timeOffcase8 = function timeOffcase8(typeText, fromDate, ToDate, workingDays) {
    var messageText = "Okay, you asked for a" + typeText + " time off from  " + fromDate + " to " + ToDate + " and that would be " + workingDays + " working days" + ". Should I go ahead ?"
    return messageText;
}
//case9
module.exports.timeOffcase9 = function timeOffcase9(typeText, fromDate) {
    var messageText = "Okay, you asked for a" + typeText + " time off on " + fromDate + " and that would be 1 working day. Should I go ahead ? "
    return messageText;
}
//case10
module.exports.timeOffcase10 = function timeOffcase10(typeText, formattedFromTime, middayFrom, workingDays) {
    var messageText = "Okay, you asked for a" + typeText + " time off from, " + formattedFromTime + " " + middayFrom + "" + " to the end of the day," + " and that would be " + workingDays + " working days" + ". Should I go ahead ?"
    return messageText;
}
//case11
module.exports.timeOffcase11 = function timeOffcase11() {
    var messageText = ""
    return messageText;
}
//case12
module.exports.timeOffcase12 = function timeOffcase12() {
    var messageText = ""
    return messageText;
}
//**************************************************

//**************************************************
// IN FUNCTION :sendLeaveSpecTimeSpecDayConfirmation


//**************************************************

//**************************************************
// IN FUNCTION :sendLeaveRangeTimeSpecDayConfirmation

//**************************************************
// IN FUNCTION :sendVacationWithLeaveConfirmation
module.exports.sendVacationWithLeaveConfirmationFunction = function sendVacationWithLeaveConfirmationFunction(messageText, fromTime, toTime, email, fromMilliseconds, toMilliseconds, type, workingDays, fromDate, ToDate) {
    var text12 = {
        "text": "",
        "attachments": [
            {
                //note that mesage retreived based on time off case number .
                "text": messageText,
                "callback_id": 'leave_with_vacation_confirm_reject',
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                    {
                        "name": 'confirm',
                        "text": "Yes",
                        "style": "primary",
                        "type": "button",
                        "value": fromTime + "," + toTime + "," + email + "," + fromMilliseconds + "," + toMilliseconds + "," + type + "," + workingDays + "," + fromDate + "," + ToDate
                    },
                    {
                        "name": 'reject',
                        "text": "No",
                        "style": "danger",
                        "type": "button",
                        "value": fromTime + "," + toTime + "," + email + "," + fromMilliseconds + "," + toMilliseconds + "," + type + "," + workingDays + "," + fromDate + "," + ToDate
                    }
                ]
            }
        ]
    }
    return JSON.stringify(text12);

}
//************************************************************************************************************************************

/*toggyHelper.js*/
// IN FUNCTION : sendHelpOptions
module.exports.sendHelpOptionsFunction = function sendHelpOptionsFunction() {
    var messageBody = {
        "text": "",
        "attachments": [
            {

                "pretext": "You can use on of the following expressions to engage with me:",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "fields": [
                    {
                        "title": "Request a time off from date to date ",
                        "value": "",
                        "short": false
                    },
                    {
                        "title": "I want a vacation from data to date",
                        "value": "",
                        "short": false
                    },
                    {
                        "title": "I am sick today ",
                        "value": "",
                        "short": false
                    },
                    {
                        "title": "Show stats ",
                        "value": "",
                        "short": false
                    },
                    {
                        "title": "Show profile ",
                        "value": "",
                        "short": false
                    }
                    ,
                    {
                        "title": "Show history ",
                        "value": "",
                        "short": false
                    },
                    {
                        "title": "Show holidays ,or show holidays from  date to date. ",
                        "value": "",
                        "short": false
                    }
                ]
            }
        ]
    }
    return JSON.stringify(messageBody);
}
//IN FUNCTION : sendVacationToManager
module.exports.messageBody_sendVacationToManager - function messageBody_sendVacationToManager(userEmail, startDate, workingDays, endDate, type, vacationId, approvalId, managerEmail) {
    var messageBody =
        {
            "text": "This folk has pending time off request:",
            "attachments": [
                {
                    "attachment_type": "default",
                    "callback_id": "manager_confirm_reject",
                    "text": userEmail,
                    "fallback": "ReferenceError",
                    "fields": [
                        {
                            "title": "From",
                            "value": startDate,
                            "short": true
                        },
                        {
                            "title": "Days/Time ",
                            "value": workingDays + " day",
                            "short": true
                        },
                        {
                            "title": "to",
                            "value": endDate,
                            "short": true
                        },
                        {
                            "title": "Type",
                            "value": type,
                            "short": true
                        }
                    ],
                    "actions": [
                        {
                            "name": "confirm",
                            "text": "Accept",
                            "style": "primary",
                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail
                        },
                        {
                            "name": "reject",
                            "text": "Reject",
                            "style": "danger",
                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail
                        }, {
                            "name": "dont_detuct",
                            "text": "Don’t Deduct ",
                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail
                        }
                    ],
                    "color": "#F35A00"
                }
            ]
        }
    return JSON.stringify(messageBody);
}
/////////////////////////////////////////////////
//IN FUNCTION : sendVacationPostRequest
module.exports.messageBody_sendVacationPostRequest - function messageBody_sendVacationPostRequest(Id, from, to, vacationType) {


    var vacationBody =
        {
            "employee_id": Id,
            "from": from,
            "to": to,
            "type": vacationType,
            "comments": "From ibrahim"
        }
    return JSON.stringify(vacationBody);

}
/**************************************************************************************************************************/
/* employee.js */
// in FUNCTION : showEmployeeProfile
module.exports.messageBody_showEmployeeProfile - function messageBody_showEmployeeProfile(name, email, manager, employeeType, hireDate) {


    var messageBody =
        {
            "text": "Your profile details",
            "attachments": [
                {
                    "attachment_type": "default",
                    "text": " ",
                    "fallback": "ReferenceError",
                    "fields": [
                        {
                            "title": "Full name ",
                            "value": body.name,
                            "short": true
                        },
                        {
                            "title": "Working days  ",
                            "value": "Sun to Thu",
                            "short": true
                        },
                        {
                            "title": "Email ",
                            "value": body.email,
                            "short": true
                        },
                        {
                            "title": "Approver 1",
                            "value": body.manager[0].name,
                            "short": true
                        },

                        {
                            "title": "Emp.type ",
                            "value": body.employeeType,
                            "short": true
                        },
                        {
                            "title": "Approver 2",
                            "value": Approver2,
                            "short": true
                        },
                        {
                            "title": "Employment date",
                            "value": body.hireDate,
                            "short": true
                        }
                    ],
                    "color": "#F35A00"
                }
            ]
        }
    return JSON.stringify(messageBody);

}

// IN FUNCTION : showEmployeeStats
module.exports.messageBody_showEmployeeStats - function messageBody_showEmployeeStats(left_over, vacation_balance, static_balance, compensation_balance, balance, sick_vacation_balance) {


    var messageBody = {
        "text": "Your stats and anuual time off details",
        "attachments": [
            {
                "attachment_type": "default",
                "text": " ",
                "fallback": "ReferenceError",
                "fields": [
                    {
                        "title": "Rolled over",
                        "value": parseFloat((body).left_over).toFixed(2) + " weeks ",
                        "short": true
                    },
                    {
                        "title": "Used time off  ",
                        "value": parseFloat(body.vacation_balance).toFixed(2) + " weeks ",
                        "short": true
                    },
                    {
                        "title": "Annual time off ",
                        "value": parseFloat(body.static_balance).toFixed(2) + " weeks ",
                        "short": false
                    },
                    {
                        "title": "Extra time off  ",
                        "value": parseFloat(body.compensation_balance).toFixed(2) + " weeks ",
                        "short": true
                    },
                    {
                        "title": "Balance",
                        "value": parseFloat(body.left_over + body.compensation_balance + body.balance).toFixed(2) + " weeks ",
                        "short": false
                    },
                    {
                        "title": "Used Sick time off  ",
                        "value": parseFloat(body.sick_vacation_balance).toFixed(2) + " weeks ",
                        "short": true
                    }
                ],
                "color": "#F35A00"
            }
        ]
    }

    return JSON.stringify(messageBody);

}
//Force submisson message
message = "Hi, HR " + managerEmail + " has posted a time off for you from " + fromDate + "-" + toDate + ".";
//cancel force submisson request from HR
message = "Hi, HR " + email + " has canceled a time off for you ( " + fromDate + "-" + toDate + " ).Sorry!";
//Manager and HR acceptance without detuction message 
message = "you have accepted the" + typeText + " request but without detuction for " + userEmail + " ( " + fromtDate + "-" + toDate + ").";
//Manager and HR rejection  message 
message = "you have rejected the" + typeText + " request detuction for " + userEmail + " ( " + fromtDate + "-" + toDate + ").";
//Manager and HR feedback when employee cancel his timeOffcase
message = userEmail + " has canceled his time off request (" + fromDate + " - " + toDate + ")"
//feedback message for employee when the approver take an action for his request
message = "The approver " + managerEmail + " has accepted your time off request without detuction ( " + fromDate + " - " + toDate + " ). Your time off is rejected. "
//Or
message = "The approver " + managerEmail + " has Approved your time off request ( " + fromDate + " - " + toDate + " ).Please wait other approvers to take an action"
//When manager want to take an action on a request but its already canceled
message = "Sorry,You can't take an action, since this time off request is already canceled."





