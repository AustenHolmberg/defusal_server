
const PORT = process.env.PORT || 5001

/*
const express = require('express')
const path = require('path')

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
*/

const WebSocketServer = require('ws');

const wss = new WebSocketServer.Server({ port: PORT })

wss.on("connection", ws => {
    console.log("New client connected");
    ws.isAlive = true;

    ws.on("message", data => {
        console.log(`Message received: ${data}`)
	wss.clients.forEach(function each(client) {
	    if (client != ws) {
	        client.send(`{"message": "${data}"}`);
	    }
	});
    });

    ws.on("close", () => {
        console.log("A client has disconnected");
    });

    ws.onerror = function () {
        console.log("Some Error occurred")
    }

    ws.on('pong', () => {
      console.log("Pong!");
      this.isAlive = true;
    });
});
console.log("The WebSocket server is running on port 5001");

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    ws.ping();
  });
}, 20000);
