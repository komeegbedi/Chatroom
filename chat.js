class Chat{

    constructor(user , room  , id){

        if(typeof user !== 'string' && typeof room !== 'string' && typeof id !== 'string'){
            throw new Error("You must pass in a string for both the user and the room in the chat constructor");
        }

        this.username = user;
        this.userID = id;
        this.chatroom = room;
        this.unsubscribe = null;
        this.chats = db.collection('chats');
        db.collection('users').doc(this.userID).update({ currentRoom: room });
    }

    getUserID(){
        return this.userID;
    }

    getName(){
        return this.username;
    }

    getRoom(){
        return this.chatroom;
    }

    async addNewChat(message){
      return await this.chats.add({
            message: message.replace(/(?:\r\n|\r|\n)/g, ' <br>'),
            room: this.chatroom,
            username: this.username,
            isEdited: false,
            sent_at: firebase.firestore.Timestamp.fromDate(new Date()) 
       });
    }

    async updateMessage(newMessage, messageID){

       return  await this.chats.doc(messageID)
                .update({
                    message: newMessage,
                    isEdited: true
                }); 
    }

    async deleteMessage(messageID){

      return await this.chats.doc(messageID).delete()
            .then(() => {
               
            }).catch((error) => {
                console.error("Error removing document: ", error);
            });

    }

    getChats(callback){
       this.unsubscribe = this.chats
                            .where('room' , '==' , this.chatroom)
                            .orderBy('sent_at')
                            .onSnapshot(snapshot => {
                                snapshot.docChanges().forEach(change => {
                                    callback(change.doc.data(), change.type , change.doc.id);
                                });

                            });
    }

    updateRoom(newRoom){
        this.chatroom = newRoom;
        db.collection('users').doc(this.userID).update({ currentRoom: newRoom });
        if(this.unsubscribe !== null){
            this.unsubscribe();
        }
    }

    async isEdited(messageID){
        return await this.chats.doc(messageID)
                    .get().then(doc => {
                        return doc.data().isEdited;
                    })
                    .catch(err =>{
                        console.log(err);
                    });
    }

    toString(){
        return this.username + " " + this.chatroom;
    }

   
}



