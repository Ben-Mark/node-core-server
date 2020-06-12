// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: process.env.BUCKET_REGION});
const logger = require('rf-commons').logger(module);

process.env.S3_TRAINED_NLP_DATA_BUCKET = 'trained.nlp.data';

// Create S3 service object
const s3Client = new AWS.S3({apiVersion: '2006-03-01', region: process.env.AWS_DEFAULT_REGION});


class S3 {//extends BaseORM {
    constructor(bucketName) {
        // super(bucketName);
        this.bucketName = bucketName || process.env.S3_TRAINED_NLP_DATA_BUCKET;
    }

    /**
     * initialize the mock data structure for testing purposes
     * @returns {Promise<*>}
     */

    initData = () => {
        return new Promise((resolve, reject) => {
            this.store.map(item => {
                try {

                } catch (err) {
                    reject(err);
                }
            });
            resolve(true);
        })
    };


    save = async (modelInfo, s3FileRelativePath) => {

        const uploadParams = {
            Bucket: this.bucketName,
            Body: modelInfo.modelReadStream,
            Key: s3FileRelativePath,
            ContentLength: modelInfo.contentLength,
            ContentType: modelInfo.contentType
        };
        logger.info("saving the trained model in s3:  ", s3FileRelativePath);
        return await this.exists(s3FileRelativePath)
            .then(exists => {
                if (!exists) {
                    return s3Client.upload(uploadParams).promise()
                        .then(data => {
                            logger.info("saved the trained model at:  ", data.Location);
                            //since the read stream gets garbage collected after using it, this field is redundant.
                            delete modelInfo.modelReadStream;
                            return data.Location;
                        })
                        .catch(err => {
                            logger.error("Error", err);
                        })
                } else {
                    return this.remove(s3FileRelativePath)
                        .then(() => this.save(modelInfo.modelReadStream, s3FileRelativePath))
                }
            });
    };


    remove = async (s3FileRelativePath) => {

        // Create params for S3.deleteBucket
        const bucketParams = {
            Bucket: this.bucketName,
            Key: s3FileRelativePath
        };

        return await this.exists(s3FileRelativePath)
            .then(exists => {
                let responseText = '';
                if (exists) {
                    return s3Client.deleteObject(bucketParams).promise()
                        .then(res => {
                            if (res.$response.error) {
                                throw new Error(res.$response.error.toString())
                            }
                            responseText = `file: ${s3FileRelativePath} has been deleted.`;
                        });
                } else {
                    responseText = `file: ${s3FileRelativePath} doesnt exists.`
                }
                console.log(responseText);
                return responseText;
            });

    };

    exists = async (s3FileRelativePath) => {

        const existsParams = {Key: s3FileRelativePath, Bucket: this.bucketName};

        return await s3Client.headObject(existsParams).promise()
            .then(res => {
                return true;
            })
            .catch(fileDoesntExist => {
                return false;
            })
    };

    get = async (s3FileRelativePath) => {

        let params = {
            Bucket: this.bucketName,
            Key: s3FileRelativePath
        };

        return await (s3Client.getObject(params).promise())
            .then(data => {
                return data.Body.toString('utf-8');
            })
            .catch(err => {
                console.error(err);
            });
    };


    getAll = async (relativeS3Dir) => {

        let params = {
            Bucket: this.bucketName,
            Prefix: relativeS3Dir
        };

        return await (s3Client.listObjects(params).promise())
            .then(res => {
                return res.Contents.map(fileContent => fileContent.Key);
            })
            .catch(err => {
                console.error(err);
            });
    }


}


module.exports = S3;