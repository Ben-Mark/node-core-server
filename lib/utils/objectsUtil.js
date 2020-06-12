const  _ = require('lodash');

module.exports = {

    getObjectsDiff(base, object) {

        function changes(base, object) {
            return _.transform(object, function (result, value, key) {
                if (!_.isEqual(value, base[key])) {
                    result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
                }
            });
        }

        return changes(base,object);
    }


};

