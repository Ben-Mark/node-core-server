const BaseHandler = require('../webSocketHandler'),
    logger = require('rf-commons').logger(module),
    ytdl = require('ytdl-core');

// Convert the revised message back to JSON and send it out
// to the specified client or all clients, as appropriate. We
// pass through any messages not specifically handled
// in the select block above. This allows the clients to
// exchange signaling and other control objects unimpeded.
function GetSongInfo(event) {
    logger.info(`clientId: ${event.clientId} requested youtube song info: ${event.videoId}`);

    ytdl.getInfo(event.videoId)
        .then(songInfo => {

            const likePercentage = songInfo.dislikes ? Math.floor(Math.abs(((songInfo.dislikes / songInfo.likes) * 100) - 100)) : undefined;
            const payload = {
                //contains the song index, once consumed, the data will propagate to the corresponding search index song
                videoId: event.videoId,
                likePercentage: likePercentage,
                likes: songInfo.likes,
                disLikes: songInfo.dislikes,
            }
            this.webSocketHandler.sendToOrigin.call(this, event, payload);
        })
        .catch(err => this.webSocketHandler.handleError.call(this, event, err))

}


// function parseTimeStringToSec(timeString) {
//     if (!timeString) {
//         return 0;
//     }
//     const arr = timeString.split(':');
//     let ans = (+arr[0]) * 60 + (+arr[1]);
//     return ans;
// }

function handleError(err, res, errMsg = '') {
    logger.error(err);
    if (!res.status)
        res.setStatus(400);
    res.send(errMsg || err.message);
}


GetSongInfo.prototype = BaseHandler.prototype;

module.exports = GetSongInfo;
