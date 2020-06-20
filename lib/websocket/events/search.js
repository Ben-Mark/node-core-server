const BaseHandler = require('../webSocketHandler'),
    logger = require('rf-commons').logger(module),
    ytSearch = require('../../youtube/ytsearch');

// Convert the revised message back to JSON and send it out
// to the specified client or all clients, as appropriate. We
// pass through any messages not specifically handled
// in the select block above. This allows the clients to
// exchange signaling and other control objects unimpeded.
function Search(event) {
    logger.info(`clientId: ${event.clientId} requested searchQuery: ${event.searchQuery}`);

    ytSearch(event)
        .catch(err => this.webSocketHandler.handleError.call(this,event,err))
        //reduce the 30 results to 15 to reduce the 30X await songInfo
        .then(songsInfo => {
            const sortedSongs = songsInfo
                .slice(0, parseInt(process.env.MAX_RESULTS))

            this.webSocketHandler.sendToOrigin.call(this, event,sortedSongs);
        })
        .catch(err => this.webSocketHandler.handleError.call(this,event,err))

}



function parseTimeStringToSec(timeString) {
    if (!timeString) {
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


Search.prototype = BaseHandler.prototype;

module.exports = Search;
