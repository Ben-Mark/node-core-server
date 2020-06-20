const express = require('express'),
    app = express(),
    expressWs = require('express-ws')(app),
    logger = require('rf-commons').logger(module);

process.env.NODE_ENV
    ? require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })
    : require('dotenv').config()


app.use(function (req, res, next) {
    console.log('middleware');
    req.testing = 'testing';
    return next();
});

app.get('/', function(req, res, next){
    console.log('get route', req.testing);
    res.end();
});

app.ws('/', function(ws, req) {
    ws.on('message', function(msg) {
        console.log(msg);
    });
    console.log('socket', req.testing);
});

app.listen(process.env.PORT);