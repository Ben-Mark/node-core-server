const express = require('express'),
    router = express.Router(),
    validateRequest = require('../validateRequests'),
    {getObjectsDiff} = require('../../utils/objectsUtil'),
    logger = require('rf-commons').logger(module),
    // youtubeSearch = require('../../youtube/search'),
    youtubeSearchWithoutApi = require('../../youtube/searchWithOutApi'),
    fetchVideoInfo = require('youtube-info');


/**
 * Once this endpoint is active, never change the texts from the database manually
 * since the UI will have a different version of that data, this server is not connected with a message broker
 */
router.post('/', (req, res) => {
    const searchWord = req.body.searchWord;

    const orm = req.app.get('orm');

    youtubeSearchWithoutApi(searchWord)
        .catch(err => handleError(err, res))
        //reduce the 30 results to 15 to reduce the 30X await songInfo
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
            const sortedSongs = songsInfo
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
                .slice(0, parseInt(process.env.MAX_RESULTS))

            res.status(200).send(sortedSongs)
        })
        .catch(err => handleError(err, res))


// await orm.get(textsCollectionName, 'customers')
//     .then(textsColl => {
//
//     })
//     .then(response => {

// })
// .catch(err => {
// handleError(err, res)
// });

});

function parseTimeStringToSec(timeString) {
    if(!timeString){
        return 0;
    }
    const arr = timeString.split(':');
    let ans = (+arr[0]) * 60 + (+arr[1]);
    return ans;
}

function handleError(err, res, errMsg = '') {
    logger.error(err);
    if (!res.status)
        res.setStatus(400);
    res.send(errMsg || err.message);
}


module.exports = router;
