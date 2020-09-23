let orm = require(`./datasources/mongo`);

const ormInstance = new orm();

module.exports = {
    orm : ormInstance
};