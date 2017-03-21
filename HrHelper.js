
/*
Send Put reques from HR to accept or reject a vacation
*/
const request = require('request');
var hrHelper = require('./HrHelper.js')
var server = require('./server.js')
var sessionFlag = 0;
var generalCookies = "initial"
var IP = process.env.SLACK_IP
module.exports.sendVacationPutRequest = function sendVacationPutRequest(vacationId, approvalId, managerEmail, status) {
    console.log("sending vacation put request " + status)
    request({
        url: "http://" + IP + "/api/v1/employee/8/balance",
        json: true,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': generalCookies
        }
    }, function (error, response, body) {
        if (response.statusCode == 403) {
            sessionFlag = 0;
        }
        hrHelper.getNewSession(managerEmail, function (cookie) {
            generalCookies = cookie;
            printLogs("vacationId" + vacationId)
            printLogs("approvalId" + approvalId)
            printLogs("managerEmail" + managerEmail)
            var uri = 'http://' + IP + '/api/v1/vacation/' + vacationId + '/managerApproval/' + approvalId
            printLogs("uri::" + uri)
            var approvalBody = {
                "id": approvalId,
                "comments": "From Ibrahim",
                "state": status,
                "type": "HR"

            }
            approvalBody = JSON.stringify(approvalBody)
            request({
                url: uri, //URL to hitDs
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': generalCookies
                },
                body: approvalBody
                //Set the body as a stringcc
            }, function (error, response, body) {
                printLogs("response.lll" + response.statusCode)
                printLogs("error" + error)

            });



        })
    })


}



/*
get new session id using login api
*/
module.exports.getNewSession = function getNewSession(email, callback) {
    printLogs("arrive at get new session")
    var res = generalCookies
    printLogs("email: " + email)

    if (sessionFlag == 1) {
        res = generalCookies
        callback(res)

    } else {
        printLogs("getting new session")
        request({
            url: 'http://' + IP + '/api/v1/employee/login', //URL to hitDs
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': generalCookies

            },
            body: email
            //Set the body as a stringcc
        }, function (error, response, body) {
            printLogs("new Session response with statusCode =" + response.statusCode)

            var cookies = JSON.stringify((response.headers["set-cookie"])[0]);
            printLogs(cookies)
            var arr = cookies.toString().split(";")
            res = arr[0].replace(/['"]+/g, '');
            printLogs("final session:" + res)
            sessionFlag = 1;
            callback(res);
        });
    }
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

module.exports.sendFeedBackMessage = function sendFeedBackMessage(responseBody) {
    console.log("responseBody.userChannelId " + responseBody.userChannelId)
    console.log("responseBody.slackUserId " + responseBody.slackUserId)
    console.log("responseBody.teamId " + responseBody.teamId)
    console.log("Arrive sendFeedBackMessage  ")
    var message = {
        'type': 'message',
        'channel': responseBody.userChannelId,
        user: responseBody.slackUserId,
        text: 'what is my name',
        ts: '1482920918.000057',
        team: responseBody.teamId,
        event: 'direct_message'
    };
    server.bot.startConversation(message, function (err, convo) {
        console.log("cannot send message")

        if (!err) {
            var text12 = {
                "text": "Manager @ahmad has accepted your time off request.Take care.",
            }
            var stringfy = JSON.stringify(text12);
            var obj1 = JSON.parse(stringfy);
            server.bot.reply(message, obj1);

        }
    });
}

module.exports.getRoleByEmail = function getRoleByEmail(email, role, callback) {
    var flag = false;
    printLogs("getting Roles ");
    request({
        url: 'http://' + IP + '/api/v1/employee/roles', //URL to hitDs
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': generalCookies

        },
        body: email
        //Set the body as a stringcc
    }, function (error, response, body) {
        if (response.statusCode == 403) {
            sessionFlag = 0;
        }
        hrHelper.getNewSession(email, function (cookies) {
            generalCookies = cookies;
            request({
                url: 'http://' + IP + '/api/v1/employee/roles', //URL to hitDs
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': generalCookies

                },
                body: email
                //Set the body as a stringcc
            }, function (error, response, body) {
                var roles = (JSON.parse(body));
                var i = 0
                while (roles[i]) {
                    printLogs("roles[i].name" + roles[i].name)
                    if (roles[i].name == role) {
                        flag = true;
                        break;
                    }
                    i++;

                }
                callback(flag)

            })
        })

    })
}