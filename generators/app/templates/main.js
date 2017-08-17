const Config = {}
const Global = {}

Config.hostname = 'beta.cmmc.io'
Config.port = 59001
Config.clientId = Math.random() * 1000

Global.mqtt = new Paho.MQTT.Client(Config.hostname, Number(Config.port), 'ws-' + Config.clientId)
const mqtt = Global.mqtt

mqtt.publish = function (topic, msg) {
  console.log('call publish')
  const message = new Paho.MQTT.Message('Hello')
  message.destinationName = 'World'
  mqtt.send(message)
}

const onConnected = function () {
  console.log('mqtt connected')
  mqtt.subscribe('MARU/#')
  clearInterval(Global.timer1)
  hideConnectingIcon()
  $('#incoming-messages').html('connected')
}

const onMessage = function (message) {
  const topic = message.destinationName
  const qos = message.qos
  const retained = message.retained
  const payloadString = message.payloadString

  console.log('Topic:     ' + topic)
  console.log('QoS:       ' + qos)
  console.log('Retained:  ' + retained)
  console.log('Message Arrived: ' + payloadString)

  const $p = $('<p class="title">' + payloadString + '</p>')
  var dateString = moment().format('h:mm:ss a')
  $('#incoming-messages').html($p)
  $('.message-header-text').text('[' + dateString + '] Message: ' + topic + (retained ? ' (retained)' : ''))
}

// called when the client loses its connection
const onConnectionLost = function (responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log('onConnectionLost:' + responseObject.errorMessage)
  }
}

function hideConnectingIcon () {
  $('.netpie-connecting').hide()
}

function connectServer () {
  mqtt.connect({onSuccess: onConnected, onFailure: function () { console.log('mqtt connect failed')}})
  mqtt.onMessageArrived = onMessage
  mqtt.onConnectionLost = onConnectionLost

  const startTime = new Date().getTime()
  Global.startedOn = startTime
  Global.timeoutOn = startTime + (10 * 1000)
  Global.timer1 = setInterval(function () {
    const currentTime = new Date().getTime()
    if (currentTime > Global.timeoutOn) {
      alert('timeout')
      clearInterval(Global.timer1)
      hideConnectingIcon()
    }
    else {
      console.log('wating... ', Global.timeoutOn - currentTime)
    }
  }, 100)
}
