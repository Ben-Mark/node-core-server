const yt = require('youtube-search-without-api-key');
const promiseRetry = require('promise-retry');
/**
 * Given a search query, searching on youtube
 * @param {string} search value.
 */

//{
//   "id": "UCA_-NVTKOlWgxgTWjqlzZlA",
//   "link": "https://www.youtube.com/channel/UCA_-NVTKOlWgxgTWjqlzZlA",
//   "kind": "youtube#channel",
//   "publishedAt": "2009-05-12T05:26:58Z",
//   "channelId": "UCA_-NVTKOlWgxgTWjqlzZlA",
//   "channelTitle": "2PacVEVO",
//   "title": "2PacVEVO",
//   "description": "2Pac on Vevo - Official Music Videos, Live Performances, Interviews and more...",
//   "thumbnails": {
//     "default": {
//       "url": "https://yt3.ggpht.com/-zo7NnyIWT-s/AAAAAAAAAAI/AAAAAAAAAAA/mpvxDO--z1U/s88-c-k-no-mo-rj-c0xffffff/photo.jpg"
//     },
//     "medium": {
//       "url": "https://yt3.ggpht.com/-zo7NnyIWT-s/AAAAAAAAAAI/AAAAAAAAAAA/mpvxDO--z1U/s240-c-k-no-mo-rj-c0xffffff/photo.jpg"
//     },
//     "high": {
//       "url": "https://yt3.ggpht.com/-zo7NnyIWT-s/AAAAAAAAAAI/AAAAAAAAAAA/mpvxDO--z1U/s800-c-k-no-mo-rj-c0xffffff/photo.jpg"
//     }
//   }
// }
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
}
