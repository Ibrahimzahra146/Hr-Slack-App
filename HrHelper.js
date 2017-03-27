
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

    hrHelper.getNewSessionwithCookie(managerEmail, function (remember_me_cookie, session_Id) {
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
                'Cookie': remember_me_cookie + ";" + session_Id
            },
            body: approvalBody
            //Set the body as a stringcc
        }, function (error, response, body) {
            printLogs("response.lll" + response.statusCode)
            printLogs("error" + error)

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
                "text": "HR  has accepted your time off request.Take care.",
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

    hrHelper.getNewSessionwithCookie(email, function (remember_me_cookie, session_Id) {
        generalCookies = cookies;
        request({
            url: 'http://' + IP + '/api/v1/employee/roles', //URL to hitDs
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': remember_me_cookie, session_Id

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
}
/***   
 * get new session_Id with remember me cookie to send it as headers Cookie:session_Id +";"remember_me+cookie
 * 
 */
module.exports.getNewSessionwithCookie = function getNewSessionwithCookie(email, callback) {
    request({
        url: 'http://' + IP + '/api/v1/employee/login', //URL to hitDs
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: email
        //Set the body as a stringcc
    }, function (error, response, body) {
        //Split remember_me cookie
        var cookies = JSON.stringify((response.headers["set-cookie"])[1]);
        var arr = cookies.toString().split(";")
        res = arr[0].replace(/['"]+/g, '');
        //Split session_ID
        var cookies1 = JSON.stringify((response.headers["set-cookie"])[0]);
        var arr1 = cookies1.toString().split(";")
        res1 = arr1[0].replace(/['"]+/g, '');
        printLogs("final session is =========>" + res)
        callback(res, res1);
    });


}
