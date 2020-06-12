const yt = require('youtube-search-without-api-key');
const promiseRetry = require('promise-retry');
/**
 * Given a search query, searching on youtube
 * @param {string} search value.
 */

module.exports = async (searchWord) => {
    // return yt.search(searchWord);

    // if anything throws, we retry

    // Conditional example
    return await promiseRetry(async function (retry, retries= parseInt(process.env.MAX_SEARCH_RETRIES)) {
        console.log('attempt number', retries);

        return await yt.search(searchWord)
            .then(results =>{
                if(results.length === 0){
                    retry(results);
                }
                return results;
            })
            .catch(function (err) {
                if (err.code === 'ETIMEDOUT') {
                    retry(err);
                }

                throw err;
            });
    });
        // .then(function (value) {
        //     // ..
        // }, function (err) {
        //     // ..
        // });

    // console.log('Videos:');
    // console.log(videos);
}
