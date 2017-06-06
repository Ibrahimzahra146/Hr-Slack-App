const env = require('.././public/configrations.js')

module.exports.sendMessageSpecEmployee = function sendMessageSpecEmployee(email, text) {
    env.mRequests.getSlackRecord(email, function (error, response, boyd) {


        var responseBody = JSON.parse(body);

        var slack_message = env.stringFile.slack_message(responseBody.userChannelId, responseBody.slackUserId, responseBody.teamId)
        env.bot.startConversation(slack_message, function (err, convo) {
            if (!err) {
                var text12 = {
                    "text": text,
                }
                var stringfy = JSON.stringify(text12);
                var obj1 = JSON.parse(stringfy);
                env.bot.reply(slack_message, obj1);
            }
        });
    });
}