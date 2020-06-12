process.env.NODE_ENV = 'dev';
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
const {orm} = require('../lib/orm');
delete process.env.SERVER_UNDER_UNIT_TEST;


const chai = require('chai');
const chaiHttp = require("chai-http");

chai.use(chaiHttp);


module.exports = {
    app: null,
    orm : orm,
    timeout: 10000,
    chai: chai
};