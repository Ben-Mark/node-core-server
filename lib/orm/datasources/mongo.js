const mongo = require('../clients/mongoclient');
const logger = require('../../utils/Logger')(module);
const connString = process.env.DB_URI;


class Mongo {

    get = async (collectionName,dbName) => {
        logger.info(`fetching ${collectionName} from mongoDB, dbName: ${dbName}`);
       return await mongo.getAll(process.env.DB_URI , dbName,collectionName)
    };

    save = async (collectionName,dbName, object,filterOptions) => {
        logger.info(`attempting to save ${collectionName} in mongoDB`);
        return await mongo.insertOne(connString, dbName, collectionName, object,{ ...{ upsert: true,multi: false }, ...filterOptions })
            .then(()=>{
                logger.info(`saved successfully ${collectionName} in mongoDB`);
                return {
                    mongo_dbName: dbName,
                    mongo_collectionName: collectionName
                }
            })
            .catch(err => {
                console.log(err);
            })
    };


}


module.exports = Mongo;
