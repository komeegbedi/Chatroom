//--------------------------------------
// AUTHOR: KOME EGBEDI
// PURPOSE: This program runs a unit test for chat.js
//-----------------------------------

const testChatObj = new Chat("kome", "programming", "xMdkMt2QVY7TQD0Gy3N8");

 //=======================================================================
 // This is test for sending a chat
async function testAddChat(){

    testChatObj.addNewChat("this is a test\nfor sending chats").then(doc => 

        console.log("Passed ! - successfully added chat!: ", doc.id)

    ).catch(err => 
        console.log("Failed ! there was an error writting to the db", err)
    );
}

//=======================================================================
// This is test for updating chat
async function testUpdateChat(){

    //this scenario is when a link is detected in a message

    testChatObj.addNewChat(`hello guys check out <a href="https://www.w3schools.com/css/css_align.asp">https://www.w3schools.com/css/css_align.asp<a> how to center a div`)
        .then(doc => {

            console.log("Passed ! - successfully added chat!: ", doc.id);
            let messageID = doc.id;

            //update message
            testChatObj.updateMessage(
                `hello guys check out https://www.w3schools.com/css/css_align.asp">https://www.w3schools.com/css/css_align.asp<a> how to center a div Horizontal & Vertical Align`,
                messageID).then(() =>

                    console.log("Passed ! - successfully updated!: ", messageID)

                ).catch(err =>
                    console.log("Failed ! -  there was an error updating message", err)
                );//updateMessage().then().catch()

        }).catch(err =>

            console.log("Failed ! - there was an error writting to the db", err)
        );//addNewChat.then().catch()
}

//=======================================================================
// This is test for deleting a chat
async function testDeleteChat(){

    testChatObj.addNewChat(`HTML IS A PROGRAMMING LANGUAGE`)
        .then(doc => {

            console.log("Passed! - successfully added chat!: ", doc.id);
            let messageID = doc.id;

            //delete message
            testChatObj.deleteMessage(messageID);

            testChatObj.chats.doc(doc.id).get().then(doc => {
                
                if(!doc.exist){
                    console.log("Passed! - document was sucessfully deleted");
                }
                else{
                    console.log("Failed !- document was not deleted");
                }

            }).catch(err => console.log("there was an error getting that document" , err));// testChatObj.chats.doc().get().then()

        }).catch(err =>

            console.log("Failed there was an error writting to the db", err)

        );//addNewChat.then().catch()

}//testDeleteChat()


 //=======================================================================
 // This is test for updating a room
 async function testRoomUpdate() {
        testChatObj.updateRoom("general");

    testChatObj.addNewChat("check if the new message went to the new room").then(doc =>{

        //check if the message went to the new room
         testChatObj.chats.doc(doc.id).get().then(docData => {

             if (docData.data().room === 'general' && testChatObj.getRoom() === 'general') {
                 console.log("Passed! - room was sucessfully updated and message was sent to new room");
             }
             else {
                 console.log("Failed !- document was not updated and messge was sent to old to room");
             }

         });// testChatObj.chats.doc().get().then()

    }).catch(err =>
         console.log("Failed ! there was an error writting to the db", err)
     );
 }


 //=======================================================================
 // all the tests to be ran
async function Tests() {


    testChatObj.getChats((data, changeType, docID) =>
        console.log("There was an update to a chat document", data, changeType, docID)
    );

    testAddChat();
    testUpdateChat();
    testDeleteChat();
    testRoomUpdate();
}


 //=======================================================================
 // Have a empty db everytime it was ran then run all the tests
async function startTest(){

    // there is no formal way to delete all documents in a collection at once 
    // we have to retrieve the documents then delete them one at a time
    testChatObj.chats.get()
        .then( querySnapshot => {

            querySnapshot.forEach(doc => {

                testChatObj.chats.doc(doc.id).delete()
                .then(() => console.log("Document was successfully deleted"))
                .catch(err => console.log("There was an error deleting documents" , err));

            });//forEach()

            //we are done clearing, we can now run all the tests
            Tests();
        })
        .catch(error => {
            console.log("Error getting documents: ", error);

        });
}//clearAllDocuments()


startTest();
