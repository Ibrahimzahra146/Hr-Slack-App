const env = require('.././public/configrations.js')


/**
 * Get slack user info like Slack Id ,team Id,hr channel ID
 * 
 */
module.exports.getSlackRecord = function getSlackRecord(email, callback) {
    console.log("getSlackRecord" + email)
    env.request({
        url: 'http://' + env.IP + '/api/v1/toffy/get-record', //URL to hitDs
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': 'JSESSIONID=24D8D542209A0B2FF91AB2A333C8FA70'
        },
        body: email
        //Set the body as a stringcc
    }, function (error, response, body) {
        if (response.statusCode == 500) {
            callback(1000, 1000, 1000)

        }
        else callback(error, response, body)
    })
}
/**
 * 
 * Get vacation info
 */
module.exports.getVacationInfo = function getVacationInfo(email, vacationId, callback) {
    env.hrHelper.getNewSessionwithCookie(email, function (remember_me_cookie, session_Id) {
        //get vacation state
        var uri = 'http://' + env.IP + '/api/v1/vacation/' + vacationId
        env.request({
            url: uri, //URL to hitDs
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': remember_me_cookie + ";" + session_Id

            }
            //Set the body as a stringcc
        }, function (error, response, body) {
            callback(error, response, body)
        })
    })
}
/**
 * 
 * Slack memberss list
 */
module.exports.getSlackMembers = function getSlackMembers(callback) {
    console.log("env.SLACK_ACCESS_TOKEN," + env.SLACK_ACCESS_TOKEN)
    env.request({
        url: env.Constants.SLACK_MEMBERS_LIST_URL + "" + env.SLACK_ACCESS_TOKEN,
        json: true
    }, function (error, response, body) {
        callback(error, response, body)
    })
}

/**
 * Delete vacation
 */
module.exports.deleteVacation = function deleteVacation(email, vacationId, callback) {
    env.request({
        url: 'http://' + env.IP + '/api/v1/vacation/' + vacationId,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': env.hrHelper.remember_me_cookie + ";" + env.hrHelper.session_Id
        },
    }, function (error, response, body) {
        callback(error, response, body);
    })
}
/**
 * get user Id By email
 */
module.exports.getUserIdByEmail = function getUserIdByEmail(callback) {
    env.hrHelper.getNewSessionwithCookie(email, function (remember_me_cookie, sessionId) {
        env.hrHelper.general_remember_me = remember_me_cookie
        env.hrHelper.general_session_id = sessionId

        env.request({
            url: "http://" + IP + "/api/v1/employee/get-id", //URL to hitDs
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': env.hrHelper.general_remember_me + ";" + env.hrHelper.general_session_id
            },
            body: email
            //Set the body as a stringcc
        }, function (error, response, body) {
            callback(error, response, body)
        })
    })
}

/**
 * get employee balance
 */
module.exports.getEmployeeBalance = function getEmployeeBalance(Id, callback) {
    env.request({
        url: "http://" + env.IP + "/api/v1/employee/" + Id + "/balance",
        json: true,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': env.hrHelper.general_remember_me + ";" + env.hrHelper.general_session_id
        }
    }, function (error, response, body) {
        callback(error, response, body)

    })
}
/**
 * get employee History
 */
module.exports.getEmployeeHistory = function getEmployeeHistory(Id, callback) {

    var uri = 'http://' + env.IP + '/api/v1/employee/' + Id + '/vacations/2017'
    env.request({
        url: uri,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': env.hrHelper.general_remember_me + ";" + env.hrHelper.general_session_id
        },
    }, function (error, response, body) {
        callback(error, response, body)
    })
}
/**
 * 
 * Get time pff rules
 * 
 */
module.exports.getTimeOffRules = function getTimeOffRules(email, callback) {
    env.hrHelper.getNewSessionwithCookie(email, function (remember_me_cookie, session_Id) {
        var url = "http://" + env.IP + "/api/v1/vacation/rules";

        env.request({
            url: url,
            json: true,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': remember_me_cookie + ";" + session_Id
            }
        }, function (error, response, body) {
            callback(error, response, body)
        })
    })
}
/**
 * Get employee profile
 * 
 */
module.exports.getEmployeeProfile = function getEmployeeProfile(email, Id, callback) {
    env.hrHelper.getNewSessionwithCookie(email, function (remember_me_cookie, session_Id) {

        env.request({
            url: "http://" + env.IP + "/api/v1/employee/" + Id,
            json: true,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': env.hrHelper.general_remember_me + ";" + env.hrHelper.general_session_id
            },
        }, function (error, response, body) {
            callback(error, response, body)
        })
    })
}
/**
 * 
 * get Id from email
 */
module.exports.getIdFromEmail = function getIdFromEmail(email, employeeEmail, callback) {
    env.hrHelper.getNewSessionwithCookie(email, function (remember_me_cookie, sessionId) {
        env.hrHelper.general_remember_me = remember_me_cookie
        env.hrHelper.general_session_id = sessionId


        env.request({
            url: "http://" + IP + "/api/v1/employee/get-id", //URL to hitDs
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': hrHelper.general_remember_me
            },
            body: employeeEmail
            //Set the body as a stringcc
        }, function (error, response, body) {
            callback(body)

        })
    });
}