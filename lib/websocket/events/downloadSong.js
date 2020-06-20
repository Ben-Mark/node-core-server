const BaseHandler = require('../webSocketHandler'),
    logger = require('rf-commons').logger(module),
    ytdl = require('ytdl-core');

// Convert the revised message back to JSON and send it out
// to the specified client or all clients, as appropriate. We
// pass through any messages not specifically handled
// in the select block above. This allows the clients to
// exchange signaling and other control objects unimpeded.
function DownloadSong(event) {
    logger.info(`clientId: ${event.clientId} youtube song download request: ${event.videoId}`);


    // let downloaded = 0

    // let info = await ytdl.getInfo(videoId);
    // let audioFormats = ytdl.filterFormats(info.formats, 'audioonly')
    // ytdl.chooseFormat({format: audioFormats})
    // console.log('Formats with only audio: ' + audioFormats.length);

    // const output = path.resolve(__dirname, 'video.mp4');

    const video = ytdl(event.videoUrl, {filter: 'audioonly'});
    let starttime;

    video.pipe(res);

    video.once('response', () => {
        starttime = Date.now();
    });

    video.on('progress', (chunkLength, downloaded, total) => {
        const percent = downloaded / total;
        const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
        const estimatedDownloadTime = (downloadedMinutes / percent) - downloadedMinutes;
        // readline.cursorTo(process.stdout, 0);
        process.stdout.write(`${(percent * 100).toFixed(2)}% downloaded `);
        process.stdout.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`);
        process.stdout.write(`running for: ${downloadedMinutes.toFixed(2)}minutes`);
        process.stdout.write(`, estimated time left: ${estimatedDownloadTime.toFixed(2)}minutes `);
        // readline.moveCursor(process.stdout, 0, -1);
    });
    video.on('end', () => {
        process.stdout.write('\n\n');
    });
    video.on('error', (err) => {
        handleError(err, res)
    });




}


function handleError(err, res, errMsg = '') {
    logger.error(err);
    if (!res.status)
        res.setStatus(400);
    res.send(errMsg || err.message);
}


DownloadSong.prototype = BaseHandler.prototype;

module.exports = DownloadSong;
