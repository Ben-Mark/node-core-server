const express = require('express'),
    router = express.Router(),
    validateRequest = require('../validateRequests'),
    s3 = require('../../orm/datasources/s3'),
    fs = require('fs'),
    youtubedl = require('youtube-dl'),
    ytdl = require('ytdl-core');


const axiosConfiguration = {
    headers: {
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*",
    }
};


/**
 * endpoint that provides the texts / faqs source to the UI
 * accepts asa a request parameter either texts or faqs
 * example:
 * /api/get/texts?clientName=...
 * /api/get/faqs?clientName=...
 */
router.get('/', async (req, res) => {

    const videoUrl = req.query.videoUrl;
    const videoId = videoUrl.split('watch?v=')[1];


    // let downloaded = 0

    // let info = await ytdl.getInfo(videoId);
    // let audioFormats = ytdl.filterFormats(info.formats, 'audioonly')
    // ytdl.chooseFormat({format: audioFormats})
    // console.log('Formats with only audio: ' + audioFormats.length);

    // const output = path.resolve(__dirname, 'video.mp4');

    const video = ytdl(videoUrl, {filter: 'audioonly'});
    let starttime;

    const head = {
        'Content-Type': 'audio/mpeg',
    };

    // return 200 with the valid mp3 stream.
    res.writeHead(200, head);

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

    // youtubedl.exec(videoUrl, ['-x', '--audio-format', 'mp3'], {start: downloaded}, function(err, output) {
    //     if (err) throw err
    //
    //     console.log(output.join('\n'))
    // })

    // const orm = req.app.get('orm');


    // const video = youtubedl(
    //     videoUrl,
    //     // Optional arguments passed to youtube-dl.
    //     ['--format=18']
    //     // ,
    //     // // Additional options can be given for calling `child_process.execFile()`.
    //     // {cwd: __dirname}
    // )


    // const video = youtubedl('https://www.youtube.com/watch?v=179MiZSibco',
    //
    //     // Optional arguments passed to youtube-dl.
    //     ['--format=18'],
    //
    //     // start will be sent as a range header
    //     {start: downloaded, cwd: __dirname})


// Will be called when the download starts.
//     video.on('info', function (info) {
//         console.log('Download started')
//         console.log('filename: ' + info._filename)
//
//         // info.size will be the amount to download, add
//         let total = info.size + downloaded
//         console.log('size: ' + total)
//
//         if (downloaded > 0) {
//             // size will be the amount already downloaded
//             console.log('resuming from: ' + downloaded)
//
//             // display the remaining bytes to download
//             console.log('remaining bytes: ' + info.size)
//         }
//     })

//     video.pipe(fs.createWriteStream(output, {flags: 'a'}))
//
// // Will be called if download was already completed and there is nothing more to download.
//     video.on('complete', function complete(info) {
//         'use strict'
//         console.log('filename: ' + info._filename + ' already downloaded.')
//     })
//
//     video.on('end', function () {
//         console.log('finished downloading!')
//     })


// Will be called when the download starts.
//     video.on('info', function (info) {
//         console.log('Download started')
//         // console.log('filename: ' + info._filename)
//         console.log('size: ' + info.size)
//         const head = {
//             'Content-Length': info.size,
//             'Content-Type': 'audio/mpeg',
//         };
//         // return 200 with the valid mp3 stream.
//         res.writeHead(200, head);
//         // fs.createReadStream(optMp3FilePathResponse.mp3FilePath)
//         //     .pipe(res);
//         video.pipe(res);
//     })

    // video.pipe(fs.createWriteStream('myvideo.mp4'))

    // let stat = fs.statSync(optMp3FilePathResponse.mp3FilePath);
    // let fileSize = stat.size;
    // const head = {
    //     'Content-Length': fileSize,
    //     'Content-Type': 'audio/mpeg',
    // };
    // // return 200 with the valid mp3 stream.
    // res.writeHead(200, head);
    // // fs.createReadStream(optMp3FilePathResponse.mp3FilePath)
    // //     .pipe(res);
    // video.pipe(res);


    // res.setHeader('Content-Type', 'application/json');
    // res.end(JSON.stringify("source"));

});

function handleError(err, res, errMsg = '') {
    logger.error(err);
    if (!res.status)
        res.setStatus(400);
    res.send(errMsg || err.message);
}


module.exports = router;
