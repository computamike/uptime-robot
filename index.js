'use strict';
var request = require('request-promise');
var base = 'https://api.uptimerobot.com/v2/';
var method_type= 'POST'

module.exports = Client;
function Client(apiKey) {
  if (apiKey === '' || typeof apiKey !== 'string') {
    throw new Error('Uptime Robot API Key must be provided');
  }
  this.request = function (method, params, callback) {
    var options = {method:method_type,
      url: base + method,
      headers:
       { 'cache-control': 'no-cache',
         'content-type': 'application/x-www-form-urlencoded' },
        form: { 
          api_key: apiKey, 
          format: 'json', 
          logs: '1',
          ...params
         } };
    return new Promise(function(resolve,reject) {
      return request(options, function (error, response, body) {
        try {
          // console.log(' ✨ ' + body)
          const bodyObj = JSON.parse(body)
          if (bodyObj.stat === 'fail') {
            throw new Error(makeError(bodyObj))
          }
          if (error) {
            throw new Error(error);
          }
          resolve(JSON.parse(body))
        } catch (error) {
          reject(error)
        }
      })
    });
  }
}
  
function makeError(res) {
  switch (res.error.type) {
    case 'invalid_parameter':
    var err = new Error( `An ${res.error.type} error has occurred : the parameter '${res.error.parameter_name}' was sent with the value '${res.error.passed_value}'.`);
      break;
  
    default:
    var err = new Error('An uptime robot error has occurred : ' + JSON.stringify(res.error) );
      break;
  }
  
  err.name = 'UptimeRobotServerError';
  return err;
}

Client.prototype.getMonitors = async function (options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};
  if (!options.logs && options.alertContacts) throw new Error('logs is required if alert contacts is true.');
  var params = {};
  if (options.monitors) params.monitors = options.monitors.join('-');
  if (options.customUptimeRatio) params.customUptimeRatio = options.customUptimeRatio.join('-');
  if (options.logs) params.logs = '1';
  if (options.alertContacts) params.alertContacts = '1';
  if (options.showMonitorAlertConcats) params.showMonitorAlertConcats = '1';
  if (options.showTimezone) params.showTimezone = '1';
  if (options.responseTimes) params.responseTimes  = '1';
  //return this.request('getMonitors',callback)
  const response = await this.request('getMonitors',params,callback)
  var monitors = response.monitors
  monitors.forEach(function (monitor) {
    if (monitor.customuptimeratio)
      monitor.customuptimeratio = monitor.customuptimeratio.split('-');
    else
      monitor.customuptimeratio = [];
    if (monitor.log)
    monitor.log.forEach(function (log) {
      log.datetime = parseDate(log.datetime);
    });
  })
  return monitors
};

Client.prototype.newMonitor = async function (options, callback) {
  // Notes : 
  // 1 = http
  // 2 = keyword - No Sub Types
  // 3 = Ping
  // 4 = Port
  // keyword_type = 1 (keyword Exists)
  // keyword_type = 2 (keyword Does not exist)
  // SubType (seems to be used with Port monitor)
  // 1 = http
  // 2 = https
  // 3 = FTP
  // 4 = SMTP
  // 5 = POP3
  // 6 = IMAP
  // 99 = custom
  if (!options.friendly_name) throw new Error('friendlyName is required');
  if (!options.url) throw new Error('url is required');
  var params = {
    friendly_name:  options.friendly_name,
    url:           options.url,
    type:          options.type || '1',
    sub_type:       options.subType,
    port:          options.port,
    keyword_type:   options.keyword_type,
    keyword_value:  options.keyword_value,
    http_username:  options.http_username,
    http_password:  options.http_password,
    alert_contacts: (options.alert_contacts || []).join('-'),
    interval:      options.interval
  };
  return this.request('newMonitor', params,callback);
};

Client.prototype.editMonitor = async function (options, callback) {
  if (!options.id) throw new Error('monitorID is required');
  var params = {
    id:                   options.id,
    friendly_name:        options.friendly_name,
    url:                  options.url,
    sub_type:             options.subType,
    port:                 options.port,
    keyword_type:         options.keywordType,
    keyword_value:        options.keywordValue,
    status:               options.status,
    http_username:  options.httpUsername,
    http_password:  options.httpPassword,
    alert_contacts: (options.alertContacts || []).join('-'),
    interval:      options.interval
  };
  return this.request('editMonitor', params, callback)
};

Client.prototype.deleteMonitor = async function (id, callback) {
  return await this.request('deleteMonitor', {'id': id },callback);
};

Client.prototype.resetMonitor = async function (monitorId, callback) {
  const response = await this.request('resetMonitor', { id: monitorId },callback);
  return response
};

Client.prototype.getAlertContacts = async function (options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};
  var params = {};
  if (options.alert_contacts) params.alert_contacts = options.alert_contacts.join('-');
  if (options.offset) params.offset = options.offset;
  if (options.limit) params.limit = options.limit;

  const response = await this.request('getAlertContacts', params, callback);
  return response
};

Client.prototype.getAllAlertContactIds = async function () {
    const contacts =await this.getAlertContacts()
    const ids = contacts.alert_contacts.map(function (c) { return c.id; });
    return ids 
};

Client.prototype.getAccountDetails = async function (callback) {
  const response = await this.request('getAccountDetails',callback)
  return response
};





var datePattern = /^(\d\d)\/(\d\d)\/(\d\d\d\d) (\d\d):(\d\d):(\d\d)$/;
function parseDate(str) {
  var match = datePattern.exec(str);
  var month = +match[1];
  var day = +match[2];
  var year = +match[3];
  var hour = +match[4];
  var minute = +match[5];
  var second = +match[6];

  return new Date(year, month - 1, day, hour, minute, second);
}
