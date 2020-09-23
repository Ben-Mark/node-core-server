let log = require('../../../utils/Logger')(module);
// Take a look at the incoming object and act on it based
// on its type. Unknown message types are passed through,
// since they may be used to implement client-side features.
// Messages with a "target" property are sent only to a user
// by that name.

function SetUserName(msg, connect) {

    let nameChanged = false;
    let origName = msg.username;

    log.info(`setName: ${origName} for clientId: ${msg.clientId}`);
    // Ensure the name is unique by appending a number to it
    // if it's not; keep trying that until it works.

    while (!isUsernameUnique.call(this,connect.roomId,origName)) {
        msg.username = origName + this.appendToMakeUnique;
        this.appendToMakeUnique++;
        nameChanged = true;
    }

    // If the name had to be changed, we send a "rejectusername"
    // message back to the user so they know their name has been
    // altered by the server.
    if (nameChanged) {
        let changeMsg = {
            clientId: msg.clientId,
            type: "reject-username",
            username: msg.username
        };
        connect.sendUTF(JSON.stringify(changeMsg));
    }

    // Set this connection's final username and send out the
    // updated user list to all users. Yeah, we're sending a full
    // list instead of just updating. It's horribly inefficient
    // but this is a demo. Don't do this in a real app.
    connect.username = msg.username;
    connect.clientId = msg.clientId;
    //this = websocket/index
    this.sendUserListToAll.call(this,connect.roomId);
    // We already sent the proper responses
    // return sendToClients;
}

// Scans the list of users and see if the specified name is unique. If it is,
// return true. Otherwise, returns false. We want all users to have unique
// names.
isUsernameUnique = function(roomId,name) {
    let isUnique = true;
    // let that = this;
    for (let i = 0; i < this.connectionArray[roomId].length; i++) {
        if(!this.connectionArray[roomId][i].username)
            continue;
        if (this.connectionArray[roomId][i].username === name) {
            isUnique = false;
            break;
        }
    }
    return isUnique;
};

module.exports = SetUserName;




