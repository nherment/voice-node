
var twilio = require('twilio');
var conf = require('./Configuration.js');
var client = twilio(conf.readConf('twilio.accountSid'), conf.readConf('twilio.secretToken'));
var uuid = require('uuid');
var hostname = conf.readConf('hostname');
var availableAgents = require('./AvailableAgents.js');
var queues = require('./Queues.js');

function ClientSocketHandler(socket) {
  var capability = new twilio.Capability(conf.readConf('twilio.accountSid'), conf.readConf('twilio.secretToken'));

  var agentID = Math.ceil(Math.random() * 10000);
  capability.allowClientIncoming(agentID);
  var token = capability.generate();

  socket.emit('twilio:token', { token: token, agentID: agentID });
  setInterval(function() {
    socket.emit('calls:list', calls);
  }, 500);

  socket.on('agent:available', function(agentInfo) {
    var confUrl = hostname + '/api/twilio/conference/' + uuid.v4();

    availableAgents[agentID] = true;
    console.log("***availableAgents", availableAgents);
    console.log('joining conf at '+ confUrl)
    client.makeCall({
      to:'client:' + agentID,
      from: conf.readConf('phoneNumber'),
      url: confUrl
    }, function(err, responseData) {

      if(err) {
        throw err
      } else {
        console.log('retrieving front of the queue '+queues['zendesk_q_1'])
        client.queues(queues['zendesk_q_1']).members('Front').update({url: confUrl}, function(err, foo) {
          if(err) console.log(err)
            if(foo) {
              console.log('CALL MEMBER')
              console.log(foo)
            }
        })
      }

    });

  });

  socket.on('agent:unavailable', function(agentInfo) {
    availableAgents[agentID] = false;
    console.log("***availableAgents", availableAgents);
  });

  // socket.on('call:answer', function(callInfo) {

  //   var sid = callInfo.sid;
  //   var confId = uuid.v4();
  //   var confUrl = hostname + '/api/twilio/conference/' + confId;

  //   client.makeCall({
  //     to:'client:' + agentID,
  //     from: conf.readConf('phoneNumber'),
  //     url: confUrl

  //   }, function(err, responseData) {

  //     if(err) {
  //       console.error(err)
  //     } else {
  //       client.calls(sid).update({url: hostname + '/api/twilio/conference/customer/'+confId})
  //     }

  //   });

  // })
}

var calls = []

pollCalls();

function pollCalls() {
  client.calls.list({status: 'in-progress'}, function(err, newCalls) {
    // console.log(newCalls.total)
    // console.log(newCalls.calls)
    calls = newCalls.calls
    setTimeout(pollCalls, 500)
  })
}

module.exports = {
  handleClient: function(socket) {
    var clientHandler = new ClientSocketHandler(socket)
  }
}
