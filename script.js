  // MQTT-Client-Optionen
  const options = {
    connectTimeout: 4000,
    clientId: 'boatusmaximus2024',
    clean: true,
    reconnectPeriod: 1000,
    debug: true,  // Aktiviert den Debug-Modus
  };

  // MQTT-Verbindung zu HiveMQ über WebSockets
  const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt', options);

  // Verbindungsstatus überwachen
  client.on('connect', function () {
    document.getElementById('brokerLED').classList.remove('off');
    document.getElementById('brokerLED').classList.add('on');
    document.getElementById('status').textContent = 'Erfolgreich verbunden mit HiveMQ Broker!';
    console.log('Erfolgreich mit HiveMQ verbunden!');
  });

  client.on('error', function (err) {
    document.getElementById('brokerLED').classList.remove('on');
    document.getElementById('brokerLED').classList.add('off');
    document.getElementById('status').textContent = 'Verbindungsfehler: ' + err.message;
    console.log('Verbindungsfehler: ', err);
  });

  client.on('message', function (topic, message) {
    console.log('Nachricht empfangen:', topic, message.toString());
  });

  // Button-LED ein/aus
  let ledState = false;
  const toggleButton = document.getElementById('toggleButton');
  toggleButton.addEventListener('click', function () {
    ledState = !ledState;
    const ledElement = document.getElementById('brokerLED');
    if (ledState) {
      ledElement.classList.remove('off');
      ledElement.classList.add('on');
    } else {
      ledElement.classList.remove('on');
      ledElement.classList.add('off');
    }
  });


  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registriert:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker Registrierung fehlgeschlagen:', error);
            });
    });
}
