const express = require('express'),
    router = express.Router();



router.ws('/ws', function (ws, req) {

    const webSocketSocketHandler = req.app.get('wsHandler')
    webSocketSocketHandler.getAndAuthConnection(ws,req)

    ws.on('message', msg => {
        webSocketSocketHandler.onMessage(msg);
    })

    ws.on('close', (connection) => {
        webSocketSocketHandler.onClose(connection.roomId)
        // onClose.bind(this, connection.roomId)
        console.log('WebSocket was closed')
    })

})

router.use('/api/search', require('./rest/search'));

module.exports = router;