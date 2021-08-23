// a chat is going to contain who sent the message , what room it was sent from , the message sent , the time it was sent
class Chat{

    constructor(user , room ){

        if(typeof user !== 'string' && typeof room !== 'string'){
            throw new Error("You must pass in a string for both the user and the room in the chat constructor");
        }

        this.username = user;
        this.chatroom = room;
        this.unsubscribe = null;
        this.chats = db.collection('chats');
    }

    async addNewChat(message){
      return await this.chats.add({
            message,
            room: this.chatroom,
            username: this.username,
            sent_at: firebase.firestore.Timestamp.fromDate(new Date()) 
       });
    }

    async updateMessage(newMessage, messageID){

       return  await this.chats.doc(messageID)
                .update({
                    message: newMessage
                })
                .then(() => {
                    console.log("Document successfully updated!");
                }).catch((error) => {
                    console.error("Error removing document: ", error);
                });  
    }

    async deleteMessage(messageID){

      return await this.chats.doc(messageID).delete()
            .then(() => {
                console.log("Document successfully deleted!");
            }).catch((error) => {
                console.error("Error removing document: ", error);
            });

    }

    getChats(){
        this.chats
        .where('room' , '==' , this.chatroom)
        .orderBy('sent_at')
        .onSnapshot(snapshot => {
            console.log(snapshot.docChanges());
        });
    }

    toString(){
        return this.username + " " + this.chatroom;
    }
}

const test = new Chat('kome' , 'general');


