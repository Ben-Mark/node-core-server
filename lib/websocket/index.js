let wsServer = require("websocket").server;

let log = require('rf-commons').logger(module);
let WebSocketSocketHandler = require('./webSocketHandler');
let routes = require('./routes');
// const websocketStream = require('websocket-stream/stream');
require('dotenv').config();
const shortId = require('shortid');
let UserLeftMsg = require('./events/userLeft');


class WSServer extends wsServer {
    constructor(config) {
        super(config);

        this.connectionArray = {};
        this.webSocketHandler = new WebSocketSocketHandler(this.connectionArray);

        // this.stream = websocketStream(this, {
        //     // websocket-stream options here
        //     binary: true,
        // });

        this.on("request", (request) => {
            let connection = this.getAndAuthConnection(request);
            connection.on("message", this.onMessage.bind(this));
            connection.on("close", this.onClose.bind(this, connection.roomId));
        })

    }

    /**
     * Set up a handler for the "message" event received over WebSocket. This
     * is a message sent by a client, and may be text to share with other
     * users, a private message (text or signaling) for one user, or a command
     * to the server.
     * @param message
     */
    onMessage = (message) => {
        if (message.type === "utf8") {
            // Process incoming data.
            log.info("Received Message: " + message.utf8Data);

            const event = JSON.parse(message.utf8Data);

            let connect;
            try {
                 connect = getConnectionForID.call(this, event);
            }catch(e){
                log.error('websocket error:  '+e)
            }

            let messageHandler = routes[event.type];

            messageHandler.call(this, event, connect);
        }
    };

    /**
     * Handle the WebSocket "close" event; this means a user has logged off
     * or has been disconnected.
     * @param connection
     * @param reason
     * @param description
     * @param roomId
     */
    onClose(roomId, connection, reason, description) {

        //the damn disconnected connection is hidden here in the conectionArray (lame)
        // filter it and capture the stupid clientId.
        //then send it via this shit:
        //new UserLeftMsg(el.clientID, el.username);
        const leftMessages = this.connectionArray[roomId]
            .filter(socket => {
                return !socket.connected;
            })
            .map(connection => {
                // return JSON.stringify({
                return {
                    type: "user-left",
                    clientId: connection.clientId,
                    username: connection.username
                };
                // log.info(`clientId: ${userLeftMsgStr.clientId} has left room: `);
                // return userLeftMsgStr;
            })


        // First, remove the connection from the list of connections.
        this.connectionArray[roomId] = this.connectionArray[roomId].filter(socket => {
            return socket.connected;
        });

        leftMessages.forEach(leftMsg => {
            log.info(`clientId: ${leftMsg.clientId} has left room: `);
            this.webSocketHandler.sendToAll.call(this, roomId, connection.clientId, leftMsg, connection.username)
            let logMessage = "Connection closed: " + leftMsg.clientId + " (" + reason;
            if (description && description.length !== 0) {
                logMessage += ": " + description;
            }

            logMessage += ")";
            log.info(logMessage);
        })

        // Now send the updated user list. Again, please don't do this in a
        // real application. Your users won't like you very much.
        // this.webSocketHandler.sendUserListToAll.call(this, roomId);

        // Build and output log output for close information.

    }


    getAndAuthConnection = (request) => {
        if (!originIsAllowed(request.origin)) {
            request.reject();
            log.error("Connection from " + request.origin + " rejected.");
            return;
        }

        // Accept the request and get a connection.
        let connection;
        try {
             connection = request.accept("json", request.origin);
        }catch(e){
            return null;
        }

        // Add the new connection to our list of connections.
        log.info("Connection accepted from " + connection.remoteAddress);

        const socketQueryParams = request.resourceURL.query;

        const roomId = socketQueryParams.roomId;
        connection.roomId = roomId;


        connection.clientId = shortId.generate();

        // Send the new client its token; it send back a "username" message to
        // tell us what username they want to use.
        let msg = {
            type: "client-id",
            key: 'clientId',
            payload: connection.clientId
        };

        if (!this.connectionArray[roomId]) {
            this.connectionArray[roomId] = [connection];
        } else {
            this.connectionArray[roomId].push(connection);
        }

        connection.sendUTF(JSON.stringify(msg));

        return connection;

    }

}


// If you want to implement support for blocking specific origins, this is
// where you do it. Just return false to refuse WebSocket connections given
// the specified origin.
function originIsAllowed(origin) {
    return true; // We will accept all connections
}


// function getUserIdByName(username) {
//     let result = connectionArray.filter(user => {
//         return user.username === username;
//     }).map(user => {
//         return user.id;
//     });
//
//     return result;
// }

// Scan the list of connections and return the one for the specified
// clientID. Each login gets an ID that doesn't change during the session,
// so it can be tracked across username changes.
function getConnectionForID(msg) {
    let connect = null;
    let i;
    const roomId = msg.roomId;
    const clientId = msg.clientId;

    if(!roomId)
        throw new Error('websocket connection message missing roomId')
    if(!clientId)
        throw new Error('websocket connection message missing clientId')

    if (this.connectionArray[roomId].length === 0)
        return null;

    for (i = 0; i < this.connectionArray[roomId].length; i++) {
        if (this.connectionArray[roomId][i].clientId === clientId) {
            connect = this.connectionArray[roomId][i];
            break;
        }
    }

    return connect;
}


// Create the WebSocket server by converting the HTTPS server into one.
module.exports = WSServer;

