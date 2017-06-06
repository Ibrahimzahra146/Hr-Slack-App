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