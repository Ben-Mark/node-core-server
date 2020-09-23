
const log = require('../../utils/Logger')(module);
const shortId = require('shortid');
const routes = require('./routes');

class WebSocketHandler {
    constructor() {
        this.appendToMakeUnique = 1;
        this.connectionArray = {};
    }

    setConnectionsArray(connectionArray) {
        if(this.connectionsArray === null){
            this.connectionsArray = connectionArray;
        }
    }

    onMessage = (message) => {
        if (typeof message === "string") {
            // Process incoming data.
            log.info("Received Message: " + message);

            const event = JSON.parse(message);

            let connect;
            try {
                connect = this.getConnectionForID(event);
            } catch (e) {
                log.error('websocket error:  ' + e)
            }

            let messageHandler = routes[event.type];

            messageHandler.call(this, event, connect);
        }
    };

    sendToOneUser = (event, payload) => {
        // let isUnique = true;

        const roomId = event.roomId;
        const clientId = event.clientId;
        const returnedEvent = {
            roomId: event.roomId,
            clientId: event.clientId,
            key: event.key,
            payload: payload
        }

        const targetId = event.targetClientId;
        const senderName = event.name;

        if (this.isRoomEmpty(roomId)) {
            return null;
        }

        for (let i = 0; i < this.connectionArray[roomId].length; i++) {
            if (this.connectionArray[roomId][i].clientId === targetId) {
                this.connectionArray[roomId][i].sendUTF(JSON.stringify(returnedEvent));
                break;
            }
        }

    };


    sendToOrigin = (event, payload) => {
        // let isUnique = true;

        const roomId = event.roomId;
        const clientId = event.clientId;
        const returnedEvent = {
            type: event.type,
            key: event.key,
            roomId: event.roomId,
            clientId: event.clientId,
            payload: payload
        }

        // const senderName = event.name;

        for (let i = 0; i < this.connectionArray[roomId].length; i++) {
            if (this.connectionArray[roomId][i].clientId === clientId) {
                try {
                    this.connectionArray[roomId][i].send(JSON.stringify(returnedEvent));
                }catch(err){
                    log.warn("websocket has been terminated and was about to send an event of type: "+returnedEvent.type);
                }
                log.info(`event key sent: ${returnedEvent.key} to clientId: ${clientId}`)
                break;
            }
        }

    };


// Sends a "userlist" message to all chat members. This is a cheesy way
// to ensure that every join/drop is reflected everywhere. It would be more
// efficient to send simple join/drop messages to each user, but this is
// good enough for this simple example.
    sendToAll = (roomId, clientId, msg, clientName) => {

        if (this.isRoomEmpty(roomId)) {
            return null;
        }

        // console.log("senderName sends to all: "+senderName);
        for (let i = 0; i < this.connectionArray[roomId].length; i++) {
            if (this.connectionArray[roomId][i].clientId === clientId) {
                continue;
            }
            this.connectionArray[roomId][i].sendUTF(JSON.stringify(msg));
        }
    };


// Sends a "userlist" message to all chat members. This is a cheesy way
// to ensure that every join/drop is reflected everywhere. It would be more
// efficient to send simple join/drop messages to each user, but this is
// good enough for this simple example.
    sendUserListToAll = (roomId) => {
        if (this.isRoomEmpty(roomId)) {
            return null;
        }

        let userListMsg = this.makeUserListMessage.call(this, roomId);
        let userListMsgStr = JSON.stringify(userListMsg);

        for (let i = 0; i < this.connectionArray[roomId].length; i++) {
            this.connectionArray[roomId][i].sendUTF(userListMsgStr);
        }

    };


// Builds a message object of type "userlist" which contains the names of
// all connected users. Used to ramp up newly logged-in users and,
// inefficiently, to handle name change notifications.
    makeUserListMessage(roomId) {

        let userListMsg = {
            type: "user-list",
            users: []
        };

        let roomLength;

        if (this.isRoomEmpty(roomId)) {
            roomLength = 0;
        } else {
            roomLength = this.connectionArray[roomId].length
        }


        // Add the users to the list
        for (let i = 0; i < roomLength; i++) {
            userListMsg.users.push({
                username: this.connectionArray[roomId][i].username,
                clientId: this.connectionArray[roomId][i].clientId
            });
        }

        return userListMsg;
    }


    isRoomEmpty = (roomId) => {
        if (this.connectionArray[roomId].length === 0)
            return null;
    };

    handleError = (event, err) => {
        event.error = err.message;
        this.sendToOrigin.call(this, event)
    }

    getAndAuthConnection(connection, request) {
        if (!originIsAllowed(request.headers.origin)) {
            request.reject();
            log.error("Connection from " + request.headers.origin + " rejected.");
            return;
        }

        // Accept the request and get a connection.
        // let connection;
        // try {
        //     connection = request.accept("json", request.headers.origin);
        // } catch (e) {
        //     return null;
        // }

        // Add the new connection to our list of connections.
        log.info("Connection accepted from " + request.headers.origin);

        const socketQueryParams = request.query;

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

        connection.send(JSON.stringify(msg));

        return connection;

    }

    // // Scan the list of connections and return the one for the specified
// // clientID. Each login gets an ID that doesn't change during the session,
// // so it can be tracked across username changes.
    getConnectionForID = (msg) => {
        let connect = null;
        let i;
        const roomId = msg.roomId;
        const clientId = msg.clientId;

        if (!roomId)
            throw new Error('websocket connection message missing roomId')
        if (!clientId)
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

        if(!this.connectionArray[roomId]){
            log.error('onClose this.connectionArray[roomId] is undefined!  printing connectionArray')
            log.info(JSON.stringify(this.connectionArray))
            return null;
        }

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
            this.sendToAll.call(this, roomId, connection.clientId, leftMsg, connection.username)
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


}

// If you want to implement support for blocking specific origins, this is
// where you do it. Just return false to refuse WebSocket connections given
// the specified origin.
function originIsAllowed(origin) {
    return true; // We will accept all connections
}


module.exports = WebSocketHandler;
