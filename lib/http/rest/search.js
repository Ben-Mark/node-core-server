const express = require('express'),
    router = express.Router(),
    logger = require('../../utils/Logger')(module),
    ytSearch = require('../../youtube/ytsearch')
    fetchVideoInfo = require('youtube-info');


/**
 * Once this endpoint is active, never change the texts from the database manually
 * since the UI will have a different version of that data, this server is not connected with a message broker
 */
router.post('/', (req, res) => {
    const searchWord = req.body.searchWord;

    const orm = req.app.get('orm');

    ytSearch(searchWord)
        .catch(err => handleError(err, res))
        //reduce the 30 results to 15 to reduce the 30X await songInfo
        .then(songsInfo => {
            const sortedSongs = songsInfo
                .slice(0, parseInt(process.env.MAX_RESULTS))

            res.status(200).send(sortedSongs)
        })
        .catch(err => handleError(err, res))


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
