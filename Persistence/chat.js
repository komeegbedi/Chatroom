//--------------------------------------
// AUTHOR: KOME EGBEDI
// PURPOSE:This chat class represents a user and all the messages they send. This class is also used to communicate with the database (firebase).
//-----------------------------------

class Chat {

    constructor(user , room  , id) {

        if(typeof user !== 'string' && typeof room !== 'string' && typeof id !== 'string'){
            throw new Error("You must pass in a string for both the user and the room in the chat constructor");
        }

        this.username = user;
        this.userID = id;
        this.chatroom = room;

        //used to unsubscribe from listening to changes on a document 
        this.unsubscribeChatChanges = null;
        this.unsubscribeTypingChanges = null;

        this.chats = db.collection('chats');
        this.currUser = db.collection('users').doc(this.userID);
        this.currUser.update({ currentRoom: room });
    }

    //=======================================================================
    //getters 
    getUserID() {
        return this.userID;
    }

    getName() { 
        return this.username;
    }

    getRoom() {
        return this.chatroom;
    }

    //=======================================================================
    // This method is listens for when there in the chat document (new chats, modified chats , deleted chats)
    // anytime there is a change the callback is called in order to display that change
    getChats(callback) {
        this.unsubscribeChatChanges =
            this.chats
                .where('room', '==', this.chatroom)
                .orderBy('sent_at')
                .onSnapshot(snapshot => {

                    snapshot.docChanges().forEach(change => {
                        callback(change.doc.data(), change.type, change.doc.id);
                    });//forEach()

                });//onSnapshot()
    }//getChats()

    //=======================================================================
    async addNewChat(message) {

      return await this.chats.add({
            message: message.replace(/(?:\r\n|\r|\n)/g, ' <br>'), // this is used to replace "newline" to the <br> tag, in order to be read it exactly the way the user wrote it.
            room: this.chatroom,
            username: this.username,
            isEdited: false,
            sent_at: firebase.firestore.Timestamp.fromDate(new Date()) 
      });//add()

    }//addNewChat()

    //=======================================================================
    async updateMessage(newMessage, messageID){ 

        return  await this.chats.doc(messageID).update({
            message: newMessage,
            isEdited: true
        }); 
    }

    //=======================================================================
    async deleteMessage(messageID){

      return await this.chats.doc(messageID).delete()
           .catch((error) => console.error("Error removing document: ", error));

    }

    //=======================================================================
    // This method updates the current room the user is in 
    // we unsubscribe from listening to chat updates (new chats , modified chats, deleted chats) in the old room and start listening in the new room
    // we also unsubscribe from listening to users that were typing in the previous room and start listening in the new room
    async updateRoom(newRoom){
        this.chatroom = newRoom;

        if (this.unsubscribeChatChanges){
            this.unsubscribeChatChanges();
        }

        if (this.unsubscribeTypingChanges) {
            this.unsubscribeTypingChanges();
        }

        return await db.collection('users').doc(this.userID).update({ currentRoom: newRoom });
    }//updateRoom()


    //=======================================================================
    // This function returns a boolean value of if a message has been modified 
    async isEdited(messageID) {

        return await this.chats.doc(messageID).get()
        .then(doc => {
            return doc.data().isEdited;
        })
        .catch(err =>console.log(err));

    }//isEdited()

     //=======================================================================
    // This function updates the typing status of a user
    async setTypingStatus(value){

        this.currUser.update({ isTyping: value });

    }//setTypingStatus()

    //=======================================================================
    // This method is listens for when there is a change in a user isTyping status
    // Parameter: function that helps display the users that are typing to the frontend
    async listenToTypingChanges(updateDisplay) {
        
        // this will only listen to changes in the current room the user is currently in 
        // when a user changes rooms, it is updated to listen to the new room

        this.unsubscribeTypingChanges =
            users.where('currentRoom', '==', this.chatroom)
                .where('name', '!=', this.username)
                .onSnapshot(snapshot => {

                    let usersTyping = [];
                    snapshot.docChanges().forEach(change => {

                        let data = change.doc.data();
                        //we only care about who is currently typing and not who has stopped typing
                        if (change.type === 'modified' && data.isTyping) {
                            usersTyping.push(data.name);
                        }

                    });//forEach()

                    updateDisplay(usersTyping);

                });//onSnapshot()
    }//listenToTypingChanges()

    //=======================================================================
    //used for debugging 
    toString(){
        return this.username + " " + this.chatroom + " " + this.userID;
    }
}



