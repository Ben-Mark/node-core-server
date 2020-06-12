if(process.env.NODE_ENV){
    require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
}else{
    require('dotenv').config();
}


const createError = require('http-errors'),
    express = require('express'),
    logger = require('morgan'),
    routes = require('./lib/routes'),
    bodyParser = require('body-parser'),
    {orm} = require('./lib/orm'),
    app = express(),
    cors = require('cors');

console.log("Server started, listening on port: " + process.env.PORT);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());
app.use('/', routes);


app.set('orm', orm);
//init youtubedl texts and faqs
// orm.initData().then(store => app.set('store', store));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send(err.message);
    console.log(err);
});


process.on('uncaughtException', function (err) {
    console.log(" UNCAUGHT EXCEPTION ");
    console.log("[Inside 'uncaughtException' event] " + err.stack || err.message);
});


module.exports = app;
