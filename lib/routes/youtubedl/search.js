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
        .then(searchResults => {
            return Promise.all(searchResults.map(async songInfo => {
                if (!songInfo.id) {
                    return {
                        duration: 0,
                        url: songInfo.link,
                    }
                }
                const durationSec = parseTimeStringToSec(songInfo.snippet.duration);
                let views;
                try{
                    views = parseInt(songInfo.snippet.views.replace(/\./g, ''))
                }catch(err){
                    console.log("views: "+songInfo.snippet.views);
                    console.log(err);
                    views = 0;
                }

                const songLikesInfo = await fetchVideoInfo(songInfo.id.videoId)
                    .catch(err => {
                        return {
                            durationSec: durationSec,
                            url: songInfo.snippet.url,
                            thumbNailUrl: songInfo.snippet.thumbnails.url,
                            title: songInfo.snippet.title,
                            views: views
                        }
                    })

                const likePercentage = songLikesInfo.dislikeCount ? Math.floor(Math.abs(((songLikesInfo.dislikeCount / songLikesInfo.likeCount) * 100) - 100)) : undefined;
                return {
                    durationSec: durationSec,
                    link: songLikesInfo.url,
                    likePercentage: likePercentage,
                    title: songInfo.snippet.title,
                    views: songLikesInfo.views,
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

                    return songInfo.durationSec > 100 && songInfo.likePercentage && isNotAnAdvertise
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
