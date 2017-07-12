const env = require('./public/configrations.js')

module.exports.showEmployeeProfile = function showEmployeeProfile(email, employeeEmail, msg) {
    var Approver2 = "---";
    env.mRequests.getIdFromEmail(email, employeeEmail, function (Id) {
        env.mRequests.getEmployeeProfile(email, Id, function (error, response, body) {
            body.manager.sort(function (a, b) {
                return a.rank - b.rank;
            });
            if (body.manager[1]) {
                Approver2 = body.manager[1].name;

            }
            var imageUrl = body.profilePicture.replace(/ /, "%20")
            var messageBody = {
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
                                "title": "Hire date",
                                "value": body.hireDate,
                                "short": true
                            },
                            {
                                "title": "Approver 2",
                                "value": Approver2,
                                "short": true
                            }
                        ],
                        "color": "#F35A00",
                        thumb_url: imageUrl
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
    env.mRequests.getIdFromEmail(email, employeeEmail, function (Id) {
        env.mRequests.getEmployeeBalance(Id, function (error, response, body) {
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

    if (numberOfExtraTime > 1) {
        type = type + "s";
    }
    var message = env.stringFile.Compensation_Confirmation_message(email, employeeEmail, numberOfExtraTime, type)
    msg.say(message)
}



//show employee history 
module.exports.showEmployeeHistory = function showEmployeeHistory(email, employeeEmail, msg) {
    msg.say(employeeEmail + " history is :")
    env.mRequests.getIdFromEmail(email, employeeEmail, function (Id) {
        env.mRequests.getEmployeeHistory(Id, function (error, response, body) {

            var i = 0;
            //check if no history ,so empty response
            if (!error && response.statusCode === 200) {

                if (!(body[i])) {
                    msg.say("There are no requested vacations for you");
                }
                else {
                    //build message Json result to send it to slack
                    while ((body)[i]) {
                        var parsedBody = body[i]
                        var stringMessage = "["
                        var fromDate = new Date(parsedBody.fromDate);
                        fromDate = fromDate.toString().split("GMT")
                        fromDate = fromDate[0]
                        var toDate = new Date(parsedBody.toDate)
                        toDate = toDate.toString().split("GMT")
                        toDate = toDate[0]
                        stringMessage = stringMessage + "{" + "\"title\":" + "\"" + "From date" + "\"" + ",\"value\":" + "\"" + fromDate + "\"" + ",\"short\":true}"
                        stringMessage = stringMessage + ","
                        stringMessage = stringMessage + "{" + "\"title\":" + "\"" + "To date" + "\"" + ",\"value\":" + "\"" + toDate + "\"" + ",\"short\":true}"
                        stringMessage = stringMessage + ","
                        stringMessage = stringMessage + "{" + "\"title\":" + "\"" + "Vacation state" + "\"" + ",\"value\":" + "\"" + parsedBody.vacationState + "\"" + ",\"short\":true}"
                        var typeOfVacation = ""
                        if (parsedBody.type == 0)
                            typeOfVacation = "Time off"
                        else if (parsedBody.type == 4)
                            typeOfVacation = "Sick time off"
                        printLogs("stringMessage::" + stringMessage);
                        stringMessage = stringMessage + "]"
                        var messageBody = {
                            "text": "*" + typeOfVacation + "*",
                            "attachments": [
                                {
                                    "attachment_type": "default",
                                    "text": " ",
                                    "fallback": "ReferenceError",
                                    "fields": stringMessage,
                                    "color": "#F35A00"
                                }
                            ]
                        }
                        var stringfy = JSON.stringify(messageBody);

                        stringfy = stringfy.replace(/\\/g, "")
                        stringfy = stringfy.replace(/]\"/, "]")
                        stringfy = stringfy.replace(/\"\[/, "[")
                        stringfy = JSON.parse(stringfy)

                        msg.say(stringfy)
                        i++;

                    }

                }
            }

        })
    })
}

