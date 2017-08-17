const Global = {
  mqtt: new Paho.MQTT.Client(Config.hostname, Number(Config.port), Config.clientId)
}

const mqtt = Global.mqtt

mqtt.publish = function (topic, payload, opts) {
  opts = opts || {}
  mqtt.send(topic, payload, opts.qos || 0, opts.retain || false)
}

const onConnected = function () {
  mqtt.subscribe('<%= mqttPrefix + mqttDeviceName %>/status', {qos: 0})
  mqtt.subscribe('<%= mqttPrefix + mqttDeviceName %>/$/#', {qos: 0})

  hideConnectingIcon()

  $('.publish-wrapper').removeClass('is-hidden')
  $('#incoming-messages').html('connected')
}

const onMessage = function (message) {
  const topic = message.destinationName
  const qos = message.qos
  const retained = message.retained
  const payloadString = message.payloadString

  /*
  console.log('Topic:     ' + topic)
  console.log('QoS:       ' + qos)
  console.log('Retained:  ' + retained)
  console.log('Message Arrived: ' + payloadString)
  */

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
  $('.mqtt-connecting').hide()
}

const onConnectFailure = function () {
  alert('mqtt connect failed')
  hideConnectingIcon()
}

function connectServer () {
  mqtt.connect({timeout: 10, onSuccess: onConnected, onFailure: onConnectFailure})
  mqtt.onMessageArrived = onMessage
  mqtt.onConnectionLost = onConnectionLost
}
