const request = require('request');
//var toffyHelper = require('.././toffyHelper.js')
var server = require('.././server.js')
var sessionFlag = 0;
var IP = process.env.SLACK_IP
/**
 * Genereta the approvers section when send the time off to them ,so any approvel can check the other approvels action
 */
module.exports.generateManagerApprovelsSection = function generateManagerApprovelsSection(managerApproval, managerEmail, callback) {
    if (!managerApproval[1]) {
        callback("")
    } else {


        var i = 0
        var size = Object.keys(managerApproval).length
        var messageBody = ""
        //Sorting Managers Approver based on rank
        managerApproval.sort(function (a, b) {
            return a.rank - b.rank;
        });
        console.log("Sorted " + size)
        while (i < size) {
            var flag = "true }"
            if ((i + 1) == size) {
                flag == "false }"
            }
            var arr = managerApproval[i].managerEmail.toString().split("@")
            if (managerApproval[i].managerEmail != managerEmail) {
                console.log("Arrivvve")
                getEmoji(managerApproval[i].state, "", "", "", function (emoji) {


                    messageBody = messageBody + "{" + "\"title\":" + "\"" + "Approver ( " + arr[0] + " )\"" + ",\"value\":" + "\"" + managerApproval[i].state + "" + emoji + "\"" + ",\"short\":" + flag
                    messageBody = messageBody + ","
                })
            }

            i++
        }
        if (messageBody != "") {
            messageBody = messageBody.replace(/}\"/g, "}")
            messageBody = messageBody.replace(/\"\{/g, "{")
            messageBody = messageBody.replace(/\\/g, "")
            messageBody = messageBody.replace(/\",\"\"/g, "")
            messageBody = messageBody.replace(/,,/, ",")
            messageBody = messageBody.replace(/\"\{/g, "{")
            console.log("messageBody:::" + messageBody)
        }

        callback(messageBody)
    }
}
/**
 * Generate manager action section(Your action)
 */
module.exports.generateYourActionSection = function generateYourActionSection(managerApproval, managerEmail, callback) {
    console.log("managerEmail" + managerEmail)
    var i = 0
    var size = Object.keys(managerApproval).length
    var messageBody = ""
    //Sorting Managers Approver based on rank
    managerApproval.sort(function (a, b) {
        return a.rank - b.rank;
    });
    while (i < size) {
        var flag = true
        console.log("managerApproval[i].email" + managerApproval[i].managerEmail)
        if (managerApproval[i].managerEmail == managerEmail) {


            messageBody = "{" + "\"title\":" + "\"" + "Your Action " + "\"" + ",\"value\":" + "\"" + managerApproval[i].state + "\"" + ",\"short\":true }"

        }

        i++
    }
    callback(messageBody)

}
//emoji
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