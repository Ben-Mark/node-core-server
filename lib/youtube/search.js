var search = require('youtube-search');
const {promisify} = require('util');

var opts = {
    maxResults: 20,
    key: process.env.YOUTUBE_API_KEY
};


module.exports = async (searchWord) => {
    return await new Promise((res, rej) => {
        search(searchWord, opts, function (err, results) {
            if (err)
                rej(err)

            res(results)
        });
    })

    //TODO: start filtering.
}