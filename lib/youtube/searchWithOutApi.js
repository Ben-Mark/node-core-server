const yt = require('youtube-search-without-api-key');
const yts = require( 'yt-search' )
const fetchVideoInfo = require('youtube-info');

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

        return await yts( searchWord )//await yt.search(searchWord)
            .then(results => {
                if(results.length === 0){
                    retry(results);
                }
                //some results dont contain views, and other data, ignore them
                return results.filter(result =>result.snippet.views)
            })
            .then(searchResults => searchResults.slice(0, parseInt(process.env.MAX_RESULTS)))
            .then(searchResults => {
                return Promise.all(searchResults.map(async songInfo => {
                    if (!songInfo.id) {
                        return {
                            duration: 0,
                            url: songInfo.link,
                        }
                    }
                    let views;
                    try {
                        views = songInfo.snippet.views ? songInfo.snippet.views.replace(/\./g, ',') : songInfo.snippet.views
                        if(!views)
                            throw new Error(views)
                    }catch (e) {
                        console.log(e);
                    }
                    const songLikesInfo = await fetchVideoInfo(songInfo.id.videoId)
                        .catch(err => {
                            return {
                                duration: songInfo.snippet.duration,
                                url: songInfo.snippet.url,
                                thumbNailUrl: songInfo.snippet.thumbnails.url,
                                title: songInfo.snippet.title,
                                views: views
                            }
                        })

                    const likePercentage = songLikesInfo.dislikeCount ? Math.floor(Math.abs(((songLikesInfo.dislikeCount / songLikesInfo.likeCount) * 100) - 100)) : undefined;
                    return {
                        duration: songInfo.snippet.duration,
                        link: songLikesInfo.url,
                        likePercentage: likePercentage,
                        title: songInfo.snippet.title,
                        views: views,
                        likes: songLikesInfo.likeCount,
                        disLikes: songLikesInfo.dislikeCount,
                        thumbNailUrl: songLikesInfo.thumbnailUrl
                    }
                }))
            })
            .then(songsInfo => {
                const searchWords = decodeURIComponent(searchWord).split(' ');
                return songsInfo
                    .filter(songInfo => {
                        const foundSearchWords = searchWords.filter(_searchWord =>{
                            return  songInfo.title.toLowerCase().includes(_searchWord.toLowerCase())
                        })

                        const isNotAnAdvertise =  foundSearchWords && Array.isArray(foundSearchWords) && foundSearchWords.length > 0

                        return songInfo.likePercentage && isNotAnAdvertise
                    })
                    .sort(function (a, b) {
                        return b.likePercentage - a.likePercentage;
                    })
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
