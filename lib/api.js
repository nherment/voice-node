var twilio = require('twilio')
var uuid = require('uuid')
var conf = require('./Configuration.js')

var hostname = conf.readConf('hostname')

var capability = new twilio.Capability(conf.readConf('twilio.accountSid'), conf.readConf('twilio.secretToken'));

var client = twilio(conf.readConf('twilio.accountSid'), conf.readConf('twilio.secretToken'))


module.exports = function(app) {

  return function() {

//    { AccountSid: 'ACecf0d3e09f9b54c472e5b7bce64d4b21',
//      ToZip: '',
//      FromState: '',
//      Called: '+441772367470',
//      FromCountry: 'SE',
//      CallerCountry: 'SE',
//      CalledZip: '',
//      Direction: 'inbound',
//      FromCity: '',
//      CalledCountry: 'GB',
//      CallerState: '',
//      CallSid: 'CA2bb139ca70005ef6d777b827deaab800',
//      CalledState: 'Preston',
//      From: '464',
//      CallerZip: '',
//      FromZip: '',
//      CallStatus: 'ringing',
//      ToCity: '',
//      ToState: 'Preston',
//      To: '+441772367470',
//      ToCountry: 'GB',
//      CallerCity: '',
//      ApiVersion: '2010-04-01',
//      Caller: '464',
//      CalledCity: '' }
    app.post('/twilio/call', function(req, res) {

      var callInfo = req.body

      var confId = uuid.v4()


      var resp = new twilio.TwimlResponse()

      resp.say('Welcome. We are looking for an agent.')
      resp.enqueue('zendesk', { waitUrl: hostname + '/api/twilio/wait/'+Date.now() })

      res.send(resp.toString())

    })

    app.post('/twilio/wait/:dateQueued', function(req, res) {

      var dateAdded = req.param('dateQueued')

      var queueSid = req.body.QueueSid
      global.queueSid = queueSid;
      console.log(queueSid)

      console.log('/twilio/wait')
      console.log(req.body)
      var resp = new twilio.TwimlResponse()

//      if(dateAdded < (Date.now()-30*1000)) {
//        return res.send('fail', 500)
//      } else {
        resp.say('Please wait while we are looking for an agent.')
        resp.play('http://s1download-universal-soundbank.com/mp3/sounds/3040.mp3')
//      }

      res.send(resp.toString())
    })


    app.post('/twilio/conference/customer/:id', function(req, res) {

      var conferenceId = req.param('id')

      var resp = new twilio.TwimlResponse()
      resp.dial({}, function() {
        this.conference(conferenceId, {waitUrl: 'http://twimlets.com/holdmusic?Bucket=com.twilio.music.electronica'})
      })
      res.send(resp.toString())
    })


    app.post('/twilio/conference/:id', function(req, res) {

      var conferenceId = req.param('id')

      var resp = new twilio.TwimlResponse()
      resp.dial({}, function() {
        this.conference(conferenceId, {waitUrl: 'http://twimlets.com/holdmusic?Bucket=com.twilio.music.electronica'})
      })
      res.send(resp.toString())
    })

    app.post('/twilio/error', function(req, res) {


      var resp = new twilio.TwimlResponse()
      resp.say('We\'re sorry but our system is under pressure')
      resp.ended();
      res.send(resp.toString())
    })

  }


}