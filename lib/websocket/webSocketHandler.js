let log = require('rf-commons').logger(module);


let Singleton = require('singleton-class');

class WebSocketHandler extends Singleton {
    constructor(connectionArray) {
        super(connectionArray);
        this.appendToMakeUnique = 1;
        this.connectionArray = connectionArray;
    }

    sendToOneUser = (event,payload) => {
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


    sendToOrigin = (event,payload,{payloadType ='utf'}) => {
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
                if(payloadType==='utf'){
                    this.connectionArray[roomId][i].sendUTF(JSON.stringify(returnedEvent));
                } else if(payloadType==='bytes'){
                    this.connectionArray[roomId][i].sendBytes(returnedEvent);
                }
                log.info('event sent to clientId: '+clientId)
                break;
            }
        }

    };


// Sends a "userlist" message to all chat members. This is a cheesy way
// to ensure that every join/drop is reflected everywhere. It would be more
// efficient to send simple join/drop messages to each user, but this is
// good enough for this simple example.
    sendToAll =  (roomId, clientId, msg, clientName) => {

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
//
// WebSocketHandler.prototype.sendUserLeftToAll = function (clientId) {
//     // let userListMsg = makeUserListMessage.call(this);
//     let userLeftMsgStr = JSON.stringify({
//         type: "user-left",
//         clientId: clientId
//     });
//     this.sendToAll(clientId,userLeftMsgStr)
//     for (let i = 0; i < this.connectionArray.length; i++) {
//         this.connectionArray[i].sendUTF(userLeftMsgStr);
//     }
// };
//


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


}




module.exports = WebSocketHandler;
