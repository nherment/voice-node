
var twilio = require('twilio')
var conf = require('./Configuration.js')
var client = twilio(conf.readConf('twilio.accountSid'), conf.readConf('twilio.secretToken'))
var uuid = require('uuid')

var hostname = conf.readConf('hostname')

function ClientSocketHandler(socket) {
  var capability = new twilio.Capability(conf.readConf('twilio.accountSid'), conf.readConf('twilio.secretToken'))
  capability.allowClientIncoming('zendesk');

  var token = capability.generate();

  socket.emit('twilio:token', { token: token });
  setInterval(function() {
    socket.emit('calls:list', calls)
  }, 500)

  socket.on('call:answer', function(callInfo) {

    var sid = callInfo.sid
    var confId = uuid.v4()
    var confUrl = 'http://xtj9.t.proxylocal.com/api/twilio/conference/'+confId

    client.makeCall({

      to:'client:zendesk',
      from: '+441772367470',
      url: confUrl

    }, function(err, responseData) {

      if(err) {
        console.error(err)
      } else {
        client.calls(sid).update({url: hostname + '/api/twilio/conference/customer/'+confId})
      }

    });

  })
}

var calls = []

pollCalls();

function pollCalls() {
  client.calls.list({status: 'in-progress'}, function(err, newCalls) {
    console.log(newCalls.total)
    console.log(newCalls.calls)
    calls = newCalls.calls
    setTimeout(pollCalls, 500)
  })
}

module.exports = {
  handleClient: function(socket) {
    var clientHandler = new ClientSocketHandler(socket)
  }
}