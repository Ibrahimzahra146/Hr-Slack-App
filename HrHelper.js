
/*
Send Put reques from HR to accept or reject a vacation
*/
var hrHelper = require('./HrHelper.js')
var sessionFlag = 0;
var generalCookies = "initial"
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