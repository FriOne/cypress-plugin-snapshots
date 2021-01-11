const http = require('http');
const socketio = require('socket.io');

const { SAVE_TEXT, SAVE_IMAGE, IMAGE_SAVED, TEXT_SAVED } = require('./actions');
const saveTextSnapshot = require('../save/saveTextSnapshot');
const { saveImageSnapshot } = require('../utils/tasks/imageSnapshots');

function initServer(config) {
  const server = http.createServer();
  const io = socketio(server);

  io.on('connection', (client) => {
    const { token } = client.handshake.query;

    if (config.serverEnabled) {
      client.on(SAVE_IMAGE, (data) => {
        if (token === config.token) {
          saveImageSnapshot(data);
          client.emit(IMAGE_SAVED, data);
        }
      });

      client.on(SAVE_TEXT, (data) => {
        if (token === config.token) {
          saveTextSnapshot(data);
          client.emit(TEXT_SAVED, data);
        }
      });
    }
  });

  if (config.serverEnabled) {
    server.listen(config.serverPort, config.serverHost);
  }
}

module.exports = initServer;
