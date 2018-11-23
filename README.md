# Uptime Robot

A simple node.js and browserify API for [uptime robot](http://uptimerobot.com/api)

    $ npm install uptime-robot

Currently, only some methods are implemented, but pull requests for the missing ones are welcome.

This library works in the browser using browserify.  You can see a demo by cloning this repo and running `npm run test-browser`.

All methods also return a [Promise](https://www.promisejs.org/) if no callback is provided.

## Example

```javascript
var Client = require('uptime-robot');
var cl = new Client('api-key');
cl.getMonitors({customUptimeRatio: [1, 7, 30]}, function (err, res) {
  if (err) throw err;
  console.dir(res);
});
```

## API

### cl.getMonitors(options, fn(err, monitors))

options:

 - see https://uptimerobot.com/api

### cl.newMonitor(options, fn(err))

options:

 - friendly_name - required
 - url - required
 - type - required (Default: 1)
 - sub_type - optional (required for port monitoring)
 - port - optional (required for port monitoring)
 - keyword_type - optional (required for keyword monitoring)
 - keyword_value - optional (required for keyword monitoring)
 - http_username - optional
 - http_password - optional
 - alert_contacts - optional (array of alert contact ids)
 - interval - optional (in minutes)

### cl.editMonitor(options, fn(err))

options:

 - id - required
 - friendly_name - optional
 - url - optional
 - sub_type - optional (used only for port monitoring)
 - port - optional (used only for port monitoring)
 - keyword_type - optional (used only for keyword monitoring)
 - keyword_value - optional (used only for keyword monitoring)
 - http_username - optional
 - http_password - optional
 - alert_contacts - optional (array of alert contact ids)
 - interval - optional (in minutes)

### cl.deleteMonitor(id, fn(err))

options:

 - id - required

### cl.resetMonitor(id, fn(err))

options:

 - id - required


### cl.getAlertContacts(options, fn(err, alertContacts))

options:

 - alert_contacts - optional (array of alert contact ids)
 - offset - optional (record to start paginating. Default: 0)
 - limit - optional (number of records to return. Default and max: 50)


### cl.getAllAlertContactIds(fn(err, alertContacts))

- alertContacts: array of all alert contact ids

## License

  MIT
