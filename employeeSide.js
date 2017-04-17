const request = require('request');
var hrHelper = require('./HrHelper.js')
var server = require('./server.js')
var sessionFlag = 0;
var generalCookies = "initial"
var IP = process.env.SLACK_IP
module.exports.showEmployeeProfile = function showEmployeeProfile(email, employeeEmail, msg) {
    var Approver2 = "---";
    printLogs("employeeEmail::" + employeeEmail)
    hrHelper.getIdFromEmail(email, employeeEmail, function (Id) {



        console.log("2-hrHelper.general_remember_me" + hrHelper.general_remember_me)
        console.log("2-hrHelper.general_session_id" + hrHelper.general_session_id)


        request({
            url: "http://" + IP + "/api/v1/employee/" + Id,
            json: true,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': hrHelper.general_remember_me + ";" + hrHelper.general_session_id
            },
        }, function (error, response, body) {
            console.log("3-" + response.statusCode)
            if (body.manager[1]) {
                Approver2 = body.manager[1].name;

            }

            printLogs("show profile bod" + JSON.stringify(body))
            printLogs("show profile bod" + response.statusCode)
            var messageBody = {
                "text": employeeEmail + " profile details",
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
            var stringfy = JSON.stringify(messageBody);
            var obj1 = JSON.parse(stringfy);
            msg.say(obj1)
        });
    })

}

function printLogs(msg) {
    console.log("msg:========>:" + msg)
}


/***** 
Show Employee stats like annual vacation and etc.. from Hr side
*****/
module.exports.showEmployeeStats = function showEmployeeStats(email, employeeEmail, msg) {
    printLogs("showEmployeeStats")
    hrHelper.getIdFromEmail(email, employeeEmail, function (Id) {
        request({
            url: "http://" + IP + "/api/v1/employee/" + Id + "/balance",
            json: true,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': hrHelper.general_remember_me + ";" + hrHelper.general_session_id
            }
        }, function (error, response, body) {
            var messageBody = {
                "text": employeeEmail + " stats and anuual time off details",
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
                                "value": parseFloat(body.consumed_vacation_balance).toFixed(2) + " weeks ",
                                "short": true
                            },
                            {
                                "title": "Annual time off ",
                                "value": parseFloat(body.deserved_vacation).toFixed(2) + " weeks ",
                                "short": true
                            },
                            {
                                "title": "Used Sick time off  ",
                                "value": parseFloat(body.consume_sick_vacation).toFixed(2) + " weeks ",
                                "short": true
                            }
                            ,
                            {
                                "title": "Extra time off  ",
                                "value": parseFloat(body.compensation_balance).toFixed(2) + " weeks ",
                                "short": false
                            },




                            {
                                "title": "Balance",
                                "value": parseFloat(body.left_over + body.compensation_balance + body.balance).toFixed(2) + " weeks ",
                                "short": true
                            }

                        ],
                        "color": "#F35A00"
                    }
                ]
            }
            var stringfy = JSON.stringify(messageBody);
            var obj1 = JSON.parse(stringfy);
            msg.say(obj1);
        });
    })
}

module.exports.sendCompensationConfirmationToHr = function sendCompensationConfirmationToHr(email, employeeEmail, numberOfExtraTime, type, msg) {
    console.log("employeeEmail" + employeeEmail)
    console.log()
    if (numberOfExtraTime > 1) {
        type = type + "s";
    }
    var text12 = {
        "text": "",
        "attachments": [
            {
                "text": "Okay, you asked to add " + numberOfExtraTime + " extra " + type + " time off for " + "" + employeeEmail + ". Should I go ahead ?",
                "callback_id": 'confirm_reject_compensation',
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                    {
                        "name": 'confirm',
                        "text": "Yes",
                        "style": "primary",
                        "type": "button",
                        "value": email + "," + employeeEmail + "," + numberOfExtraTime + "," + type
                    },
                    {
                        "name": 'reject',
                        "text": "No",
                        "style": "danger",
                        "type": "button",
                        "value": email + "," + employeeEmail + "," + numberOfExtraTime + "," + type
                    }
                ]
            }
        ]
    }
    msg.say(text12)
}



