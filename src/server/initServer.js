const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');

const { SAVE_TEXT, SAVE_IMAGE, IMAGE_SAVED, TEXT_SAVED, LOAD_IMAGE, LOADED_IMAGE } = require('./actions');
const saveTextSnapshot = require('../save/saveTextSnapshot');
const { saveImageSnapshot, loadImage } = require('../utils/tasks/imageSnapshots');

function initServer(config) {
  const server = http.createServer();
  const io = socketio(server);

  io.on('connection', (client) => {
    const { token } = client.handshake.query;

    if (config.serverEnabled) {
      client.on(LOAD_IMAGE, (path) => {
        try {
          const base64File = loadImage(path);

          client.emit(LOADED_IMAGE, base64File);
        }
        catch (error) {
          client.emit('error', error);
        }
      });

      client.on(SAVE_IMAGE, (data) => {
        saveImageSnapshot(data);
        client.emit(IMAGE_SAVED, data);
      });

      client.on(SAVE_TEXT, (data) => {
        saveTextSnapshot(data);
        client.emit(TEXT_SAVED, data);
      });
    }
  });

  if (config.serverEnabled) {
    server.listen(config.serverPort, config.serverHost);
  }
}

module.exports = initServer;
