const logger = require('../../../utils/Logger')(module),
    ytSearch = require('../../../youtube/search');

// Convert the revised message back to JSON and send it out
// to the specified client or all clients, as appropriate. We
// pass through any messages not specifically handled
// in the select block above. This allows the clients to
// exchange signaling and other control objects unimpeded.
function Search(event) {
    logger.info(`clientId: ${event.clientId} requested searchQuery: ${event.searchQuery}`);

    ytSearch(event)
        .catch(err => this.handleError.call(this,event,err))
        //reduce the 30 results to 15 to reduce the 30X await songInfo
        .then(songsInfo => {
            const sortedSongs = songsInfo
                .slice(0, parseInt(process.env.MAX_RESULTS))

            this.sendToOrigin.call(this, event,sortedSongs);
        })
        .catch(err => this.handleError.call(this,event,err))

}


module.exports = Search;
