let orm = require(`./datasources/s3`);

const ormInstance = new orm();

module.exports = {
    orm : ormInstance
};