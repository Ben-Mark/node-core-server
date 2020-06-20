const yts = require( 'yt-search' )

const promiseRetry = require('promise-retry');
const logger = require('rf-commons').logger(module);
/**
 * Given a search query, searching on youtube
 * @param {string} search value.
 */

// {
//     "type": "video",
//     "title": "2Pac - Versace | 2020",
//     "description": "NEW 2020 ✪ 2Pac - Versace | GalilHD ✪ ☑ Beat By: Anabolic Beatz ...",
//     "url": "https://youtube.com/watch?v=EsWw8KuDAMg",
//     "videoId": "EsWw8KuDAMg",
//     "seconds": 196,
//     "timestamp": "3:16",
//     "duration": {
//        "seconds": 196,
//        "timestamp": "3:16"
//     },
//     "views": 151882,
//     "thumbnail": "https://i.ytimg.com/vi/EsWw8KuDAMg/default.jpg",
//     "image": "https://i.ytimg.com/vi/EsWw8KuDAMg/hqdefault.jpg",
//     "ago": "2 months ago",
//     "author": {
//     "name": "GalilHD",
//     "id": "UC2QuVmFSLlJIuK_CP99VSlQ",
//     "url": "/channel/UC2QuVmFSLlJIuK_CP99VSlQ",
//     "userId": "",
//     "userName": "",
//     "userUrl": "",
//     "channelId": "UC2QuVmFSLlJIuK_CP99VSlQ",
//     "channelUrl": "/channel/UC2QuVmFSLlJIuK_CP99VSlQ",
//     "channelName": "GalilHD"
// }
// }


/**
 * get info
 *
 * related_videos: array (similar to above)
 * likes: int
 * dislikes: int
 * age_restricted : false
 * full: true
 */
module.exports = async (event) => {
    // return yt.search(searchWord);

    // if anything throws, we retry

    // Conditional example
    return await promiseRetry(async function (retry, retries= parseInt(process.env.MAX_SEARCH_RETRIES)) {
        logger.info(`youtube fetching search results for clientId: ${event}: attempt number ${retries}`);

        return await yts( event.searchQuery )
            .then(results => {
                if(results.videos.length === 0){
                    retry(results);
                }
                //some results dont contain views, and other data, ignore them
                return results.videos;//.filter(result =>result.snippet.views)
            })
            // .then(searchResults => searchResults.slice(0, parseInt(process.env.MAX_RESULTS)))
            .then(searchResults => {
                return searchResults.map(songInfo => {
                    if (!songInfo.videoId) {
                        return {
                            duration: 0,
                            url: songInfo.url,
                        }
                    }
                    return {
                        duration: songInfo.duration.timestamp,
                        link: songInfo.url,
                        title: songInfo.title,
                        views: songInfo.views,
                        thumbNailUrl: songInfo.thumbnail,
                        videoId: songInfo.videoId
                    }
                })
            })
            .then(songsList => {
                const searchWords = decodeURIComponent(event.searchQuery).split(' ');
                return songsList
                    .filter(songInfo => {
                        const foundSearchWords = searchWords.filter(_searchWord =>{
                            return  songInfo.title.toLowerCase().includes(_searchWord.toLowerCase())
                        })

                        return foundSearchWords && Array.isArray(foundSearchWords) && foundSearchWords.length > 0
                    })

                    // .sort(function (a, b) {
                    //     return b.likePercentage - a.likePercentage;
                    // })
                // .slice(0, parseInt(process.env.MAX_RESULTS))

                // res.status(200).send(sortedSongs)
            })
            .catch(function (err) {
                if (err.code === 'ETIMEDOUT') {
                    retry(err);
                }

                throw err;
            });
    });
}