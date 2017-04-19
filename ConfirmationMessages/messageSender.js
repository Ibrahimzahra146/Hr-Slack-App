const request = require('request');
var hrHelper = require('.././HrHelper.js')
var server = require('.././server.js')
var sessionFlag = 0;
var generalCookies = "initial"
var IP = process.env.SLACK_IP
module.exports.sendMessageSpecEmployee = function sendMessageSpecEmployee(email, text) {
    request({
        url: 'http://' + IP + '/api/v1/toffy/get-record', //URL to hitDs
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': 'JSESSIONID=24D8D542209A0B2FF91AB2A333C8FA70'
        },
        body: email
        //Set the body as a stringcc
    }, function (error, response, body) {
        var responseBody = JSON.parse(body);

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
            if (!err) {
                var text12 = {
                    "text": text,
                }
                var stringfy = JSON.stringify(text12);
                var obj1 = JSON.parse(stringfy);
                server.bot.reply(message, obj1);
            }
        });
    });
}