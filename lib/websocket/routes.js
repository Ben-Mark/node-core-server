module.exports = {
    "set-username": require('./events/setUserName'),
    "search": require('./events/search'),
    "get-song-info": require('./events/getSongInfo'),
    "new-user-joined": require('./events/newUserJoined'),
    "download-song":require('./events/downloadSong')
};

