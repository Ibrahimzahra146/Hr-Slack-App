var env = require('.././public/configrations.js')

//var messageReplacer = require('.././messagesHelper/replaceManagerActionMessage.js')

/**
 * This function check the state of a given vacation in order the manager 
 * 
 */

module.exports.getSecondApproverStateAndFinalState = function getSecondApproverStateAndFinalState(email, body, state, callback1) {
    console.log(JSON.stringify(body))
    console.log("getSecondApproverStateAndFinalState")

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
                if (JSON.parse(body).managerApproval[i].managerEmail == email && state == 1 && JSON.parse(body).managerApproval[i].type == "HR") {
                    console.log("Callback l")

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
                setTimeout(callback, 100);

            },
            function (err) {
                // 5 seconds have passed
            }

        );
    }

}
