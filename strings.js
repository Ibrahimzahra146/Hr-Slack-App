const deactivated_message = "Your account has been deactivated. You are not allowed to use the system"
exports.deactivated_message = deactivated_message

//permesiion denied message
const permession_denied_message = "Sorry!.You dont have the permession to use this bot."
exports.permession_denied_message = permession_denied_message

module.exports.slack_message = function (userChannelId, slackUserId, teamId) {
    const slack_message = {
        'type': 'message',
        'channel': userChannelId,
        user: slackUserId,
        text: 'what is my name',
        ts: '1482920918.000057',
        team: teamId,
        event: 'direct_message'
    };
    return slack_message;
}
/**
 * Compensation original message
 */
module.exports.Compensation_Confirmation_message = function Compensation_Confirmation_message(email, employeeEmail, numberOfExtraTime, type) {
    var message = {
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
                    }
                    ,
                    {
                        "name": 'Yeswithcomment',
                        "text": "Yes with comment",
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
    return message
}