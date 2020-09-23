var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
const logger = require('../../utils/Logger')(module);
let _db = null;

const connection = (connectionString,dbName) => {
    return new Promise((fulfill, reject) => {
        if (!dbName && _db)
            return fulfill(_db);
        return MongoClient.connect(connectionString, {},function (err, client) {
            if (err) {
                console.log("MongoDB Error ", err);
                return reject(err);
            }
            if (dbName)
                _db = client.db(dbName);
            else _db = client;
            _db.on('close', function () {
                _db = null;
            });
            return fulfill(_db);
        });
    })
};


const getAll = async (connectionString,dbName, collectionName,fromDate, toDate, moreConstraints) => {
    var db = await connection(connectionString,dbName);
    var collection = db.collection(collectionName);
    var constraint = {};
    if (fromDate)
        constraint["current.ts"] = {$gt: +fromDate};
    if (fromDate && toDate)
        constraint["current.ts"].$lt = +toDate;
    if (moreConstraints)
        Object.keys(moreConstraints).forEach(key => {
            constraint[key] = moreConstraints[key]
        });

    var query = collection.find(constraint);

    return new Promise((reslove, reject) => {
        query.toArray(function (err, arr) {
            if (err) {
                return reject(err);
            }
            reslove(arr);
        })
    });
};



const insertOne = async (connectionString,dbName, collectionName, object) => {

    let db = await connection(connectionString,dbName);

    return new Promise((resolve, reject) => {

        db.collection(collectionName).insertOne(object, function (error, response) {
            if (error) {
                reject();
                logger.error('Error occurred while inserting ' + error);
            } else {
                resolve(response);
            }
            db.close();
        });

    });
};

module.exports = {
    getAll: getAll,
    insertOne: insertOne,
    MongoClient: MongoClient
};