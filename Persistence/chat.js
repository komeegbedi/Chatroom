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

        this.unsubscribeChatChanges = null;
        this.unsubscribeTypingChanges = null;

        this.chats = db.collection('chats');
        this.currUser = db.collection('users').doc(this.userID);
        this.currUser.update({ currentRoom: room });
    }

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

    getChats(callback) {
        this.unsubscribeChatChanges =
            this.chats
                .where('room', '==', this.chatroom)
                .orderBy('sent_at')
                .onSnapshot(snapshot => {

                    snapshot.docChanges().forEach(change => {
                        callback(change.doc.data(), change.type, change.doc.id);
                    });

                });
    }

    async addNewChat(message) {

      return await this.chats.add({
            message: message.replace(/(?:\r\n|\r|\n)/g, ' <br>'), // this is used to replace "newline" to the <br> tag, in order to be read it exactly the way the user wrote it.
            room: this.chatroom,
            username: this.username,
            isEdited: false,
            sent_at: firebase.firestore.Timestamp.fromDate(new Date()) 
       });

    }

    async updateMessage(newMessage, messageID){ 

        return  await this.chats.doc(messageID).update({
            message: newMessage,
            isEdited: true
        }); 
    }

    async deleteMessage(messageID){

      return await this.chats.doc(messageID).delete()
           .catch((error) => {
                console.error("Error removing document: ", error);
            });

    }

    updateRoom(newRoom){
        this.chatroom = newRoom;

        db.collection('users').doc(this.userID).update({ currentRoom: newRoom });

        if (this.unsubscribeChatChanges){
            this.unsubscribeChatChanges();
        }

        // update the room we are listening to for who is typing
        // we are checking if "unsubscribeTypingChanges" variable has a value because if the user has not typed in any room, it will be null 
        // there is a possibilities of the user just chnaging rooms

        if (this.unsubscribeTypingChanges) {
            this.unsubscribeTypingChanges();
        }
    }

    async isEdited(messageID){
        return await this.chats.doc(messageID).get()
        .then(doc => {
            return doc.data().isEdited;
        })
        .catch(err =>{
            console.log(err);
        });
    }

    async setTypingStatus(value){
        this.currUser.update({ isTyping: value });
    }

    async listenToTypingChanges(updateDisplay) {
        
        this.unsubscribeTypingChanges =
            users.where('currentRoom', '==', this.chatroom)
                .where('name', '!=', this.username)
                .onSnapshot(snapshot => {

                    let usersTyping = [];
                    snapshot.docChanges().forEach(change => {

                        let data = change.doc.data();
                        if (change.type === 'modified' && data.isTyping) {
                            usersTyping.push(data.name);
                        }
                    });

                    updateDisplay(usersTyping);

                });
    }

    //used for debugging 
    toString(){
        return this.username + " " + this.chatroom;
    }
}



