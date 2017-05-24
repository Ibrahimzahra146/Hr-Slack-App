const request = require('request');
var hrHelper = require('.././HrHelper.js')
var server = require('.././server.js')
var sessionFlag = 0;
var generalCookies = "initial"
var IP = process.env.SLACK_IP
//var employee = require(".././employeeSide.js")
var async = require('async');
//var messageReplacer = require('.././messagesHelper/replaceManagerActionMessage.js')

/**
 * This function check the state of a given vacation in order the manager 
 * 
 */
module.exports.getVacationState = function getVacationState(email, vacationId, callback) {
    console.log("getVacationState")
   hrHelper .getNewSessionwithCookie(email, function (remember_me_cookie, sessionId) {
        hrHelper.general_remember_me = remember_me_cookie
        hrHelper.general_session_id = sessionId

        var uri = "http://" + IP + "/api/v1/vacation/" + vacationId
        console.log(uri)
        request({
            url: uri, //URL to hitDs
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': hrHelper.general_remember_me + ";" + sessionId
            }
            //Set the body as a stringcc
        }, function (error, response, body) {
            console.log("Response.statusCode:" + response.statusCode)
            callback(response.statusCode, body)

        })
    });
}
module.exports.getSecondApproverStateAndFinalState = function getSecondApproverStateAndFinalState(email, body, state, callback1) {

    var approver2Email = "--"
    var approver2Action = "--"
    var myAction = "--"

    var vacationState = "--"
    //no second Approver 
    if (state == 0 && !(JSON.parse(body).managerApproval[1])) {
        callback1("--", "--", JSON.parse(body).vacationState)
    } else {
        var i = 0;
        async.whilst(
            function () { return JSON.parse(body).managerApproval[i]; },
            function (callback) {
                if (JSON.parse(body).managerApproval[i].managerEmail == email && state == 1) {
                    console.log("Callback ")

                    approver2Email = JSON.parse(body).managerApproval[i].managerEmail
                    approver2Action = JSON.parse(body).managerApproval[i].state
                    vacationState = JSON.parse(body).vacationState
                    callback1(approver2Email, approver2Action, vacationState)
                }
                else if (JSON.parse(body).managerApproval[i].managerEmail != email && state == 0) {

                    approver2Email = JSON.parse(body).managerApproval[i].managerEmail
                    approver2Action = JSON.parse(body).managerApproval[i].state
                    vacationState = JSON.parse(body).vacationState
                    callback1(approver2Email, approver2Action, vacationState)
                }
                i++
                setTimeout(callback, 500);

            },
            function (err) {
                // 5 seconds have passed
            }

        );
    }





}