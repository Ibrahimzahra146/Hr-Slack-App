const request = require('request');
var hrHelper = require('.././HrHelper.js')
var server = require('.././server.js')
var sessionFlag = 0;
var generalCookies = "initial"
var IP = process.env.SLACK_IP
module.exports.replaceMessage = function replaceMessage(msg, userEmail, managerEmail, fromDate, toDate, type, approvalType, vacationId, approvalId, ImageUrl, typeText, workingDays, approver2Email, approver2Action, vacationState) {
    getEmoji(approver2Action, vacationState, type, approvalType, function (approverActionEmoji, finalStateEmoji, typeEmoji, myActionEmoji) {
        console.log("ImageUrl" + ImageUrl)
        var messageBody = {
            "text": "Time off request:",
            "attachments": [
                {
                    "attachment_type": "default",
                    "callback_id": "manager_confirm_reject",
                    "text": userEmail,
                    "fallback": "ReferenceError",
                    "fields": [
                        {
                            "title": "From",
                            "value": fromDate,
                            "short": true
                        },
                        {
                            "title": "Days/Time ",
                            "value": workingDays + " day",
                            "short": true
                        },
                        {
                            "title": "to",
                            "value": toDate,
                            "short": true
                        },
                        {
                            "title": "Type",
                            "value": type + " " + typeEmoji,
                            "short": true
                        }
                        ,
                        {
                            "title": "Your action ",
                            "value": approvalType + " " + myActionEmoji,
                            "short": true
                        }
                        ,
                        {
                            "title": "Approver2 action",
                            "value": approver2Action + " " + approverActionEmoji,
                            "short": true
                        },
                        {
                            "title": "Final state",
                            "value": vacationState + " " + finalStateEmoji,
                            "short": true
                        }

                    ],
                    "actions": [
                        {
                            "name": "Undo",
                            "text": "back",
                            "type": "button",

                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                        }, {
                            "name": "check_state_undo",
                            "text": ":arrows_counterclockwise:",

                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                        },
                    ],
                    "color": "#F35A00",
                    "thumb_url": ImageUrl,
                }
            ]
        }
        msg.respond(msg.body.response_url, messageBody)
    })
}
//return original message when click on undo
module.exports.undoAction = function unduAction(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays, approver2Action, vacationState, myAction) {
    console.log("myAction" + myAction)
    getEmoji(approver2Action, vacationState, type, myAction, function (approverActionEmoji, finalStateEmoji, typeEmoji, myActionEmoji) {
        var dont_detuct_button = ""
        if (type != "WFH") {
            dont_detuct_button = {
                "name": "dont_detuct",
                "text": "Don’t Deduct ",
                "type": "button",
                "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
            }
        }
        var messageBody = {
            "text": "Time off request:",
            "attachments": [
                {
                    "attachment_type": "default",
                    "callback_id": "manager_confirm_reject",
                    "text": userEmail,
                    "fallback": "ReferenceError",
                    "fields": [
                        {
                            "title": "From",
                            "value": fromDate,
                            "short": true
                        },
                        {
                            "title": "Days/Time ",
                            "value": workingDays + " day",
                            "short": true
                        },
                        {
                            "title": "to",
                            "value": toDate,
                            "short": true
                        },
                        {
                            "title": "Type",
                            "value": type + " " + typeEmoji,
                            "short": true
                        }
                        ,
                        {
                            "title": "Your action ",
                            "value": myAction + " " + myActionEmoji,
                            "short": true
                        }
                        ,
                        {
                            "title": "Approver2 action",
                            "value": approver2Action + " " + approverActionEmoji,
                            "short": true
                        },
                        {
                            "title": "Final state",
                            "value": vacationState + " " + finalStateEmoji,
                            "short": true
                        }

                    ],
                    "actions": [
                        {
                            "name": "confirm",
                            "text": "Accept",
                            "style": "primary",
                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                        },
                        {
                            "name": "reject",
                            "text": "Reject",
                            "style": "danger",
                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                        },
                        {
                            "name": "reject_with_comment",
                            "text": "Reject with comment",
                            "style": "danger",
                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                        }, dont_detuct_button
                        , {
                            "name": "check_state",
                            "text": ":arrows_counterclockwise:",

                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                        },
                    ],
                    "color": "#F35A00",
                    "thumb_url": ImageUrl,
                }
            ]
        }
        msg.respond(msg.body.response_url, messageBody)
    })
}

module.exports.replaceWithComment = function replaceWithComment(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays, approver2Email, approver2Action, vacationState, myAction) {
    getEmoji(approver2Action, vacationState, type, myAction, function (approverActionEmoji, finalStateEmoji, typeEmoji, myActionEmoji) {

        var dont_detuct_button = ""

        var messageBody = {
            "text": "Time off request:",
            "attachments": [
                {
                    "attachment_type": "default",
                    "callback_id": "manager_confirm_reject",
                    "text": userEmail,
                    "fallback": "ReferenceError",
                    "fields": [
                        {
                            "title": "From",
                            "value": fromDate,
                            "short": true
                        },
                        {
                            "title": "Days/Time ",
                            "value": workingDays + " day",
                            "short": true
                        },
                        {
                            "title": "to",
                            "value": toDate,
                            "short": true
                        },
                        {
                            "title": "Type",
                            "value": type + " " + typeEmoji,
                            "short": true
                        }
                        ,
                        {
                            "title": "Your action ",
                            "value": myAction + " " + myActionEmoji,
                            "short": true
                        }
                        ,
                        {
                            "title": "Approver2 action",
                            "value": approver2Action + " " + approverActionEmoji,
                            "short": true
                        },
                        {
                            "title": "Final state",
                            "value": vacationState + " " + finalStateEmoji,
                            "short": true
                        }
                    ],
                    "actions": [
                        {
                            "name": "Send_comment",
                            "text": "Sorry",

                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl + ";Sorry!."
                        },
                        {
                            "name": "Send_comment",
                            "text": "Project deadline",

                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl + ";Project deadline."
                        },

                        {
                            "name": "Send_comment",
                            "text": "Discuss it privately",

                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl + ";Discuss it privately."
                        },
                        {
                            "name": "Send_comment",
                            "text": "No replaceable emp",
                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl + ";No replaceable emp."
                        }, {
                            "name": "Undo",
                            "text": "back",

                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                        }

                    ],
                    "color": "#F35A00",
                    "thumb_url": ImageUrl,
                }
            ]
        }
        msg.respond(msg.body.response_url, messageBody)
    })
}

/**
 * Refresh the current message
 */

module.exports.replaceCanceledRequestOnAction = function replaceCanceledRequestOnAction(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays) {


    var messageBody = {
        "text": "Time off request:",
        "attachments": [
            {
                "attachment_type": "default",
                "callback_id": "manager_confirm_reject",
                "text": userEmail,
                "fallback": "ReferenceError",
                "fields": [
                    {
                        "title": "From",
                        "value": fromDate,
                        "short": true
                    },
                    {
                        "title": "Days/Time ",
                        "value": workingDays + " day",
                        "short": true
                    },
                    {
                        "title": "to",
                        "value": toDate,
                        "short": true
                    },
                    {
                        "title": "Type",
                        "value": type,
                        "short": true
                    }
                    ,
                    {
                        "title": "State",
                        "value": "Cancelled by employee :no_entry_sign:",
                        "short": true
                    }
                ],

                "color": "#F35A00",
                "thumb_url": ImageUrl,
            }
        ]
    }
    msg.respond(msg.body.response_url, messageBody)
}
/**
 * Check state of not canceled request
 * 
 */
module.exports.replaceMessageOnCheckState = function replaceMessageOnCheckState(msg, userEmail, managerEmail, fromDate, toDate, type, vacationId, approvalId, ImageUrl, workingDays, approver2Email, approver2Action, vacationState, myAction) {
    getEmoji(approver2Action, vacationState, type, myAction, function (approverActionEmoji, finalStateEmoji, typeEmoji, myActionEmoji) {


        var dont_detuct_button = ""
        if (type != "WFH") {
            dont_detuct_button = {
                "name": "dont_detuct",
                "text": "Don’t Deduct ",
                "type": "button",
                "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
            }
        }
        console.log("replaceMessageOnCheckState")
        var messageBody = {
            "text": "Time off request:",
            "attachments": [
                {
                    "attachment_type": "default",
                    "callback_id": "manager_confirm_reject",
                    "text": userEmail,
                    "fallback": "ReferenceError",
                    "fields": [
                        {
                            "title": "From",
                            "value": fromDate,
                            "short": true
                        },
                        {
                            "title": "Days/Time ",
                            "value": workingDays + " day",
                            "short": true
                        },
                        {
                            "title": "to",
                            "value": toDate,
                            "short": true
                        },
                        {
                            "title": "Type",
                            "value": type + " " + typeEmoji,
                            "short": true
                        }
                        ,
                        {
                            "title": "Your action ",
                            "value": myAction + " " + myActionEmoji,
                            "short": true
                        }
                        ,
                        {
                            "title": "Approver2 action",
                            "value": approver2Action + " " + approverActionEmoji,
                            "short": true
                        },
                        {
                            "title": "Final state",
                            "value": vacationState + " " + finalStateEmoji,
                            "short": true
                        }

                    ], "actions": [
                        {
                            "name": "confirm",
                            "text": "Accept",
                            "style": "primary",
                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                        },
                        {
                            "name": "reject",
                            "text": "Reject",
                            "style": "danger",
                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                        },
                        {
                            "name": "reject_with_comment",
                            "text": "Reject with comment",
                            "style": "danger",
                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                        }, dont_detuct_button
                        , {
                            "name": "check_state",
                            "text": ":arrows_counterclockwise:",

                            "type": "button",
                            "value": userEmail + ";" + vacationId + ";" + approvalId + ";" + managerEmail + ";employee" + ";" + fromDate + ";" + toDate + ";" + type + ";" + workingDays + ";" + ImageUrl
                        },
                    ],

                    "color": "#F35A00",
                    "thumb_url": ImageUrl,
                }
            ]
        }
        msg.respond(msg.body.response_url, messageBody)
    })
}
//
function getEmoji(state, finalState, type, myAction, callback) {
    var approverActionEmoji = ":thinking_face:"
    var typeEmoji = ""
    var finalStateEmoji = ":thinking_face:"
    var myActionEmoji = ":thinking_face:"
    if (state == "--") {
        var approverActionEmoji = ""

    }
    if (state == "Rejected") {
        approverActionEmoji = ":no_entry_sign:"
    } else if (state == "Approved") {
        approverActionEmoji = ":white_check_mark:"
    }
    if (type == "sick") {
        typeEmoji = ":ambulance:"
    }
    if (finalState == "Rejected") {
        finalStateEmoji = ":no_entry_sign:"
    } else if (finalState == "Approved") {
        finalStateEmoji = ":white_check_mark:"
    }
    if (myAction == "Rejected") {
        myActionEmoji = ":no_entry_sign:"
    } else if (myAction == "Approved") {
        myActionEmoji = ":white_check_mark:"
    }

    callback(approverActionEmoji, finalStateEmoji, typeEmoji, myActionEmoji)

}


