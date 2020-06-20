if(process.env.NODE_ENV){
    require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
}else{
    require('dotenv').config();
}


let http = require("http");
let https = require("https");
let url = require("url");
let fs = require("fs");
let log = require('rf-commons').logger(module);
let WebSocketServer = require('./lib/websocket');
require('dotenv').config();


const httpServer = http.createServer(function (request, response) {
    log.info("Received secure request for " + request.url);
    response.write("Reactive frames, signaling server");
    response.end();
});


// Spin up the HTTPS server on the port assigned to this sample.
// This will be turned into a WebSocket port very shortly.
httpServer.listen(process.env.PORT, function () {
    log.info(`Server is listening on port ${process.env.PORT}`);
});


// Create the WebSocket server by converting the HTTPS server into one.
new WebSocketServer({
    httpServer: httpServer,
    autoAcceptConnections: false
});


