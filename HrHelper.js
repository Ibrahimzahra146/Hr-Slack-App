const env = require('./public/configrations.js')
/*
Send Put reques from HR to accept or reject a vacation
*/

var general_remember_me = ""
exports.general_remember_me = general_remember_me;
exports.general_session_id = general_session_id
var general_session_id = ""
module.exports.sendVacationPutRequest = function sendVacationPutRequest(vacationId, approvalId, managerEmail, status) {
    console.log("sending vacation put request " + status)

    env.hrHelper.getNewSessionwithCookie(managerEmail, function (remember_me_cookie, session_Id) {

        var uri = 'http://' + env.IP + '/api/v1/vacation/' + vacationId + '/managerApproval/' + approvalId
        printLogs("uri::" + uri)
        var approvalBody = {
            "id": approvalId,
            "comments": "From Ibrahim",
            "state": status,
            "type": "HR"

        }
        approvalBody = JSON.stringify(approvalBody)
        env.request({
            url: uri, //URL to hitDs
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': remember_me_cookie + ";" + session_Id
            },
            body: approvalBody
            //Set the body as a stringcc
        }, function (error, response, body) {


        });



    })


}




function printLogs(msg) {
    console.log("msg:========>::" + msg)
}
function getIdByEmail(email, callback) {

    makePostRequest('employee/get-id', email, function (response, body) {
        printLogs("body:" + body)
        callback(body)
    })

}

module.exports.sendFeedBackMessage = function sendFeedBackMessage(responseBody, hrEmail, fromDate, toDate, approvalType, comment) {
    var hrComment = "Comment: " + comment
    if (comment == "")
        hrComment = ""
    var message = {
        'type': 'message',
        'channel': responseBody.userChannelId,
        user: responseBody.slackUserId,
        text: 'what is my name',
        ts: '1482920918.000057',
        team: responseBody.teamId,
        event: 'direct_message'
    };
    env.bot.startConversation(message, function (err, convo) {
        console.log("cannot send message")

        if (!err) {
            var text12 = {
                "text": "HR " + hrEmail + " has " + approvalType + " your time off request" + " ( " + fromDate + "-" + toDate + ").Take care.\n" + hrComment,
            }
            var stringfy = JSON.stringify(text12);
            var obj1 = JSON.parse(stringfy);
            env.bot.reply(message, obj1);

        }
    });
}

module.exports.getRoleByEmail = function getRoleByEmail(email, role, callback) {
    var flag = false;
    printLogs("getting  Roles ");

    env.hrHelper.getNewSessionwithCookie(email, function (remember_me_cookie, session_Id) {
        if (remember_me_cookie == 1000) {
            callback(1000)
        } else {
            env.request({
                url: 'http://' + env.IP + '/api/v1/employee/roles', //URL to hitDs
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': remember_me_cookie + ";" + session_Id

                },
                body: email
                //Set the body as a stringcc
            }, function (error, response, body) {
                console.log("body" + body)

                var roles1 = (JSON.parse(body));
                var i = 0
                while (roles1.roles[i]) {
                    printLogs("roles[i].name" + roles1.roles[i].name)
                    if (roles1.roles[i].name == role || roles1.roles[i].name == "HR_OFFICER") {
                        flag = true;

                        break;
                    }
                    i++;

                }
                callback(flag)


            })
        }
    })
}
/***   
 * get new session_Id with remember me cookie to send it as headers Cookie:session_Id +";"remember_me+cookie
 * 
 */
module.exports.getNewSessionwithCookie = function getNewSessionwithCookie(email, callback) {
    env.request({
        url: 'http://' + env.IP + '/api/v1/employee/login', //URL to hitDs
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: email
        //Set the body as a stringcc
    }, function (error, response, body) {
        if (response.statusCode == 500 || response.statusCode == 451) {
            callback(1000, 1000)
        } else {

            var cookies = JSON.stringify((response.headers["set-cookie"])[1]);
            var arr = cookies.toString().split(";")
            res = arr[0].replace(/['"]+/g, '');
            var cookies1 = JSON.stringify((response.headers["set-cookie"])[0]);
            var arr1 = cookies1.toString().split(";")
            res1 = arr1[0].replace(/['"]+/g, '');
            callback(res, res1);
        }
    });


}


/**
 * 
 */
module.exports.addExtraTimeOffrequest = function addExtraTimeOffrequest(email, employeeEmail, numberOfExtraWeeks, type) {


}
module.exports.showEmployeesBalance = function showEmployeesBalance(msg, email, number, quantityType, periodType) {
    console.log("showEmployeesBalance")
    console.log("number" + number);
    console.log("quantityType" + quantityType)
    var from_to_request = ""
    if (quantityType == "more than") {
        from_to_request = "from-balance=" + number;
    } else if (quantityType == "less than") {
        from_to_request = "to-balance=" + number;
    } else if (quantityType == "minus") {
        from_to_request = "to-balance=" + 0;
    }
    else from_to_request = "from-balance=" + number + "&" + "to-balance=" + number;
    ``
    env.hrHelper.getNewSessionwithCookie(email, function (remember_me_cookie, session_Id) {
        var url = "http://" + env.IP + "/api/v1/employee/vacation-balance/2017?" + from_to_request;
        console.log(url)
        env.request({
            url: url,
            json: true,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': remember_me_cookie + ";" + session_Id
            }
        }, function (error, response, body) {
            console.log(JSON.stringify(body))
            var i = 0;
            var stringMessage = "["
            if (!error && response.statusCode === 200) {
                if (!(body)[i]) {
                    msg.say("There are no employees with that balance.");
                }
                else {
                    //build message Json result to send it to slack
                    while (body[i]) {

                        if (i > 0) {
                            stringMessage = stringMessage + ","
                            parseFloat(body[i].totalBalance).toFixed(2)
                        }
                        stringMessage = stringMessage + "{" + "\"title\":" + "\"" + (body)[i].email + "\"" + ",\"value\":" + "\"" + parseFloat(body[i].totalBalance).toFixed(2) + " week\"" + ",\"short\":true}"
                        i++;



                    }
                    printLogs("stringMessage::" + stringMessage);

                    stringMessage = stringMessage + "]"
                    var messageBody = {
                        "text": "The Employees are:",
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
                    printLogs("messageBody" + messageBody)
                    var stringfy = JSON.stringify(messageBody);

                    printLogs("stringfy " + stringfy)
                    stringfy = stringfy.replace(/\\/g, "")
                    stringfy = stringfy.replace(/]\"/, "]")
                    stringfy = stringfy.replace(/\"\[/, "[")
                    stringfy = JSON.parse(stringfy)

                    msg.say(stringfy)
                }
            }

        });
    })


}

module.exports.getTodayDate = function getTodayDate(callback) {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    today = yyyy + '/' + mm + '/' + dd;
    callback(today)

}
module.exports.convertTimeFormat = function convertTimeFormat(time, callback) {
    console.log("The Time is =" + time)
    var arr = time.toString().split(":")
    var formattedTime = ""
    var midday = "pm";
    var TimeforMilliseconds = ""
    var n = arr[1].length;
    if (n == 1) {
        arr[1] = "0" + arr[1]
    }

    if (arr[0] == "13" || arr[0] == "01" || arr[0] == "1") {
        formattedTime = "01:" + arr[1];
        TimeforMilliseconds = "13:" + arr[1]
    }
    else if (arr[0] == "14" || arr[0] == "02" || arr[0] == "2") {
        formattedTime = "02:" + arr[1];
        TimeforMilliseconds = "14:" + arr[1]
    }
    else if (arr[0] == "15" || arr[0] == "03" || arr[0] == "3") {
        formattedTime = "03:" + arr[1];
        TimeforMilliseconds = "15:" + arr[1]
    }
    else if (arr[0] == "16" || arr[0] == "04" || arr[0] == "4") {
        formattedTime = "04:" + arr[1];
        TimeforMilliseconds = "16:" + arr[1]
    }
    else if (arr[0] == "17" || arr[0] == "05" || arr[0] == "05") {
        formattedTime = "05:" + arr[1];
        TimeforMilliseconds = "17:" + arr[1]
    }
    else if (arr[0] == "20" || arr[0] == "08" || arr[0] == "8") {
        formattedTime = "08:" + arr[1];
        midday = "am"
        TimeforMilliseconds = "8:" + arr[1]

    }
    else if (arr[0] == "21" || arr[0] == "09" || arr[0] == "9") {
        formattedTime = "09:" + arr[1];
        midday = "am"
        TimeforMilliseconds = "9:" + arr[1]
    }
    else if (arr[0] == "22" || arr[0] == "10") {
        formattedTime = "10:" + arr[1];
        midday = "am"
        TimeforMilliseconds = "10:" + arr[1]
    }
    else if (arr[0] == "23" || arr[0] == "11") {
        formattedTime = "11:" + arr[1];
        midday = "am"
        TimeforMilliseconds = "11:" + arr[1]
    }
    else if (arr[0] == "00" || arr[0] == "12") {
        formattedTime = "12:" + arr[1];
        midday = "am"
        TimeforMilliseconds = "12:" + arr[1]
    }

    else {
        formattedTime = arr[0] + ":" + arr[1];
        midday = "am";
    }
    console.log("TimeforMilliseconds" + TimeforMilliseconds)
    callback(formattedTime, midday, TimeforMilliseconds)
}
//send Vacation Post request for force vacation 
module.exports.sendVacationPostRequest = function sendVacationPostRequest(from, to, employee_id, email, type, callback) {

    env.mRequests.getIdByEmail(email, email, function (Id) {
        console.log("::::" + "::" + email + "::" + Id)
        var vacationType = "6"


        var vacationBody = {
            "employee_id": Id,
            "from": from,
            "to": to,
            "type": vacationType,
            "comments": "From ibrahim"

        }
        vacationBody = JSON.stringify(vacationBody)
        var uri = 'http://' + env.IP + '/api/v1/vacation'
        printLogs("Uri " + uri)
        env.request({
            url: uri, //URL to hitDs
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': env.hrHelper.general_remember_me + ";" + env.hrHelper.general_session_id
            },

            body: vacationBody
            //Set the body as a stringcc
        }, function (error, response, body) {

            var vacationId = (JSON.parse(body)).id;
            var managerApproval = (JSON.parse(body)).managerApproval
            callback(vacationId, managerApproval);

        })
    });



}
function printLogs(msg) {
    console.log("msg:========>:" + msg)
}
