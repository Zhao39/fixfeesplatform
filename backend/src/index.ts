import * as http from 'http';
import * as https from 'https';
import { BASE_URL, PORT, SSL_CHAIN_CERT, SSL_PRIVATE_KEY, NMI_IS_LIVE } from './var/env.config';
import { isMainThread } from 'worker_threads';
import { Socket } from './socket/socket';
import app from './server'; // This should be your Express app
import { cronIndex } from './cronjob/cron.index';

const fs = require('fs');

// Define your test route here before starting the server
app.post('/test1', (req, res) => {
  res.send('Simple test route working');
});

console.log(`isMainThread:::::::`, isMainThread);

let server: http.Server;
let httpsServer: https.Server;
let socket: any;
let export_data = null;

if (isMainThread) {
  console.log('NMI_IS_LIVE:::', NMI_IS_LIVE);

  let options = {};
  let base_url: string = BASE_URL;
  let current_schema = 'http';

  if (base_url.includes('https://')) {
    console.log('https server started.............' + base_url);
    current_schema = 'https';
    options = {
      key: fs.readFileSync(SSL_PRIVATE_KEY),
      cert: fs.readFileSync(SSL_CHAIN_CERT),
    };

    httpsServer = https.createServer(options, app).listen(PORT);
    httpsServer.on('error', (e: Error) => {
      console.log('Error starting server::::::::::', e);
    });

    httpsServer.on('listening', () => {
      console.log(
        `Https Server started on port ${PORT} on env ${process.env.NODE_ENV || 'dev'}`,
      );
    });
  } else {
    console.log('http server started.............');
    server = http.createServer(app);
    server.listen(PORT);

    server.on('error', (e: Error) => {
      console.log('Error starting server::::', e);
    });

    server.on('listening', () => {
      console.log(
        `Server started on port ${PORT} on env ${process.env.NODE_ENV || 'dev'}`,
      );
      console.log(`Server running at: ${base_url}`);
    });
  }

  export_data = {
    server: null,
    socket: null,
    cronIndex: null,
  };

  if (current_schema === 'https') {
    socket = new Socket(httpsServer);
    export_data = {
      server: httpsServer,
      socket: socket,
      cronIndex: cronIndex,
    };
  } else {
    socket = new Socket(server);
    export_data = {
      server: server,
      socket: socket,
      cronIndex: cronIndex,
    };
  }
}

export default export_data;
export const socketInstance = socket;