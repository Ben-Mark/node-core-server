const express = require('express'),
    {createServer} = require("http"),
    expressWs = require('express-ws'),
    app = express(),
    logger = require('./lib/utils/Logger')(module),
    WebSocketSocketHandler = require('./lib/http/websocket/webSocketHandler');

process.env.NODE_ENV
    ? require('dotenv').config({path: `.env.${process.env.NODE_ENV}`})
    : require('dotenv').config()

webSocketSocketHandler = new WebSocketSocketHandler();
app.set('wsHandler',webSocketSocketHandler);

const server = createServer(app);

server.listen(process.env.PORT, () =>{
    logger.info(`Server running on port: ${process.env.PORT}`)
});
expressWs(app, server)

app.use(express.json({extended: false}));
app.use("/", require("./lib/http"));