//--------------------------------------
// AUTHOR: KOME EGBEDI
// PURPOSE: This program handles the logic of how the entire chat works (sending, deleting, modifying chats, detecting links, see when a using is typing)
//-----------------------------------

const chatForm = document.querySelector('div.chat-box form');
const textArea = chatForm.querySelector('textarea');
const chatArea = document.querySelector('div.main-chat-text');

let deleteID; // holds the ID of the message about to be deleted, it only has a value when the user clicks the delete button and goes to undefined after that
let chatObj; // holds the chat object created at the start of the program

//=======================================================================
// This function handles the modification of messages (edit or delete a message)
const modifyChat = () => {

    let initalMessage; // this variable stores the text that was initially saved so we don't loose track of it

    chatArea.addEventListener('click', e => {

        let parentTag = e.target.parentNode.parentNode;

        if (e.target.classList.contains('edit')) { // editing messages 

            initalMessage = editMessage(parentTag);
        }

        else if (e.target.classList.contains('delete')) { // deleting messages

            // the process that actually deletes the chat is in the function deleteChat() and not called here because I needed to show a warning message in a Modal to alert the user
            // the modal shows up when the delete button is clicked and if the user plans to continue with deleting the message then the message is the deleted
            // if the process was added here, everytime the delete button is clicked, the event listener on the "Understood" button in the Modal will be added everytime
            // that's why a seperate function is created for the actual process of deleting the message. 
            // When the user clicks the "delete" button we are storing the ID of that message so if they proceed with deleting, we know what message to actually delete 
            deleteID = parentTag.getAttribute('id');
        }

        else if (e.target.classList.contains('cancel')) { // undo message edit

            undoMessageEdit(initalMessage, parentTag);
        }

        else if (e.target.classList.contains('save')) { // save edited Mesage

            saveEditedMessage(initalMessage, parentTag);

        }//if- else if - else if -else if


    }); //addEventListener()

}//modifyChat()


//=======================================================================
//This function does the process of actually deleting a message 
const deleteChat = () => {

    const myModal = new bootstrap.Modal(document.getElementById('staticBackdrop'));

    //this process is done after the user has clicked the "Understood" button on the Modal that pops up 
    // we should already have the ID of the message to be deleted (deleteID)

    document.querySelector('button#delete').addEventListener('click', () => {

        if (deleteID) { // this should be true most of the time but just to be safe

            chatObj.deleteMessage(deleteID);
            deleteID = undefined;

            myModal.hide();

            //user will get a notification that the message has been deleted that fades away after 3 secs
            let notification = `
                 <div class="alert alert-success animate__animated animate__fadeInDown" role="alert">
                    Your message was successfully deleted
                </div>`;

            document.querySelector('section.chat-area.grid > div:nth-child(2)').insertAdjacentHTML("afterbegin", notification);

            //remove the notifactaion after 2 secs
            let deleteNotification = document.querySelector('section.chat-area.grid .alert.alert-success');
            setTimeout(() => {

                deleteNotification.classList.remove('animate__fadeInDown');
                deleteNotification.classList.add('animate__fadeOutUp');

                deleteNotification.onanimationend = () => {
                    deleteNotification.remove();
                };

            }, 2000);

        }//if()

    });// addEventListener()

    // this event listener is for the "cancel" button on the modal
    // i.e. the user does not want to delete the message anymore
    document.querySelector('button#close').addEventListener('click', () => {
        deleteID = undefined;
    });

}//deleteChat()


//=======================================================================
// This function handles the process of editing a message 
// Parameter is the entire message element trying to be edited
// Returns the text in the message before any edit
const editMessage = chatElement  => {

    //get the paragraph the user wants to edit and get the text from the paragraph
    let chatText = chatElement.querySelector('p');
    let initalText = chatText.innerHTML;

    //the innerHTML from the paragraph will also return the tags that we embedded in the text 
    // when a user is trying to edit a message, we want to strip out all the tags embeded in the paragraph
    // and show them plain text (basically exactly how they typed it at the beginning)

    let text = chatText.innerHTML.replace(/<[^>]*>/g, tag => {

        // there are only two tags we injected which are the <br> tag and the <a> tag 
        // an other tag was added by the user 

        if (tag.match('<br\s*\/?>')) {  //for <br> tags replace that with a newline character 
            return "\n";
        }
        else if (tag.match(/<a [^>]+>([^<]+)<\/a>/)) { // for <a> tags, show the text between the tags <a>
            return tag.match(/<a [^>]+>([^<]+)<\/a>/)[1];
        }

        return ""; // for any other tags ignore it and replace it with an empty string

    }); // end replace 

    //users are going to be able to edit their text from a textarea 

    let editInput = `
                <textarea class"edit-input" style="height:${chatText.offsetHeight * 2}px" spellcheck="true" autocapitalize="off" autocomplete="off">${text.trim()}</textarea>
                `;

    // we want to replace the paragraph with the text area (the text area will be at the position the paragraph being edited was)
    let links = chatElement.querySelectorAll('div.modify a');
    chatElement.childNodes[1].insertAdjacentHTML('afterend', editInput);
    chatText.remove();

    // the modification buttons will also have to be changed as well
    links[0].innerHTML = 'Cancel';
    links[0].setAttribute('class', 'cancel');

    links[1].innerHTML = 'Save';
    links[1].setAttribute('class', 'save');

    links[1].removeAttribute('data-bs-target');
    links[1].removeAttribute('data-bs-toggle');

    return initalText;

}//editMessage()


//=======================================================================
// This function updates a message after it's been edited 
const saveEditedMessage = (initalText, parent) => {

    let newText = parent.querySelector('textarea').value.trim().replace(/<[^>]*>/g, ""); // we want to filter an tag they user may have typed in
    newText = newText.replace(/(?:\r\n|\r|\n)/g, ' <br>');  //replace all new line characters with the <br> tag

    let html;

    chatObj.isEdited(parent.getAttribute('id')).then(isEdited => {

        /*
            comparing the values between the old and new message here because if we compare the values first before calling the isEdited() function
            i.e.  if(text not the same ){update it in db} else{show the initial text}
            both conditions need to update the html on the page after executing
            since the isEdited() is an async and will take some time to finish and actual have a value in the "html" variable
            when trying update the html on the page, the "html" variable will be undefined 
        */

        if (newText.length !== 0 && newText.localeCompare(initalText) !== 0) {

            chatObj.updateMessage(newText, parent.getAttribute('id'));
            html = `<p class="usertext">${detectUrl(newText)}</p>`;
            
            //if it hasn't been edited previously
            if (!isEdited) {
                html += `<span class="edited">(edited)</span>`;
            }
        }

        else {
            html = `<p class="usertext">${initalText}</p>`;
        }

        //update the html page
        parent.childNodes[1].insertAdjacentHTML('afterend', html);
        parent.querySelector('textarea').remove();
        let links = parent.querySelectorAll('div.modify a');

        links[0].innerHTML = 'Edit';
        links[0].setAttribute('class', 'edit');

        links[1].innerHTML = 'Delete';
        links[1].setAttribute('class', 'delete');

        links[1].setAttribute('data-bs-target', '#staticBackdrop');
        links[1].setAttribute('data-bs-toggle', 'modal');


    }).catch(err => console.log(err));

}//saveEditedMessage()

//=======================================================================
// This function cancels the message edit process
// This is when a user changes their mind about ending a message 

const undoMessageEdit = (initalText, parent) => {

    //replace the textarea tag back to the paragraphy tag
    let html = `<p class="usertext">${initalText}</p>`;
    parent.childNodes[1].insertAdjacentHTML('afterend', html);
    parent.querySelector('textarea').remove();
    let links = parent.querySelectorAll('div.modify a');

    //the modification buttons will be changed 
    links[0].innerHTML = 'Edit';
    links[0].setAttribute('class', 'edit');

    links[1].innerHTML = 'Delete';
    links[1].setAttribute('class', 'delete');

    links[1].setAttribute('data-bs-target', '#staticBackdrop');
    links[1].setAttribute('data-bs-toggle', 'modal');

}//undoMessageEdit()

//=======================================================================
//This function detects URLs in a user's message 
// takes in the user's message and check if it contains a URL
// if the text contains a URL,  take out the URL and wrap it in an anchor tag
// return the entire message with the URLs wrapped in anchor tags  
const detectUrl = message => {

    let urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;

    message = message.replace(urlRegex, (url) => { 

        let hyperlink = url;

        if (!hyperlink.match('^https?:\/\/')) { //if the detected URL does not have https at start of the link
            hyperlink = 'http://' + hyperlink;

        }//if()

        return `<a href="${hyperlink}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });

    return message;

}//detectUrl()

//=======================================================================
//This function updates the UI when ever there is any change with the messages (new messages , edited messages , deleted messages , updated messages)
const updateUI = () =>{
    
    chatObj.getChats((chat , changeType , ID) =>{

        let chatBubble;

        let message = detectUrl(chat.message);
      
        if (changeType === 'added') {

          
           let format;

           // If the message was sent, display the hour: minute am/pm
           // if it was sent in a different year, display the Month Day, Year hour: minute am/pm
           // if it was sent the same year but not today, display the Day of the week, Month date of the month hour: minute am/pm
           if ( dateFns.isToday(chat.sent_at.toDate()) ){
               format = 'h:mm a';
           }
           else if (chat.sent_at.toDate().getFullYear() !== new Date().getFullYear() ){
               format = 'MMM Do, YYYY h:mm a';
           }
           else{
               format = 'ddd, MMM Do h:mm a';
           }
          
           //create the chat bubble to be displayed 
            chatBubble = `
                        <div class="user-chat" id ="${ID}">
                            <h3 class="username">
                                ${chat.username} 
                                <span class="time">
                                    ${
                                        dateFns.format(
                                            chat.sent_at.toDate(), 
                                            format, 
                                            {
                                                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                                            }
                                        )
                                    }
                                </span>
                            </h3>
                            <p class="usertext">${message}</p>`;

        
           if (chat.isEdited){

                chatBubble += `<span class="edited">(edited)</span>`;
            }
            
            //show modification buttons to only the person who sent the chat
            if(chat.username.localeCompare(chatObj.getName()) === 0){ 

                  chatBubble +=  `<div class="modify">
                                        <a href="#" class="edit">Edit</a>
                                        <a href="#" class="delete" data-bs-toggle="modal" data-bs-target="#staticBackdrop">Delete</a>
                                    </div>`;
            }

            chatBubble += `</div>`; // close the div of the entire chat bubble 

            chatArea.innerHTML += chatBubble;
            let newChat = document.getElementById(ID);
            chatArea.scrollTo({ top: newChat.offsetTop , left: newChat.offsetLeft, behavior: 'smooth' });

       }

        else if (changeType === 'modified'){

            let modifiedText = document.getElementById(ID);
            modifiedText.querySelector('p').innerHTML = message;
            
            if(! modifiedText.querySelector('span.edited') ){

                modifiedText.querySelector('p').insertAdjacentHTML("afterend", `<span class="edited">(edited)</span>`);

            }//if

        }

       else if (changeType === 'removed'){
           document.getElementById(ID).remove();
       }//if- else if - else if

    });//getChats()

    displayUsersTyping();
}


//=======================================================================
// This function handles the switching of rooms 
// When a user switches a room, wee have to unsubcribe from listening for changes in that room and listen to chnages in the new room

const changeRoom = () =>{

    const burgerBar = document.querySelector('div#nav-icon3');
    const menuList = document.querySelector('.interest');

    document.querySelector('div.channels').addEventListener('click' , e =>{

        let clickedOn;
        
        //the button to switch rooms contains an image(svg) and a span tag (for the text)
        // there is a possible that the user may click the either the image or the span which is still inside the button 
        // but the event tag is going to return the either the image tag or the span tag that was clicked
        // we have to check for that as well

        if (e.target.tagName === 'BUTTON') { // when the actual button is clicked
            clickedOn = e.target;
        }
        else if (e.target.parentNode.tagName === 'BUTTON') { // either the image or the span tag was clicked 
            clickedOn = e.target.parentNode;
        }

        if(clickedOn) {

            document.querySelector('div.main-chat-area div#overlay').style.display = 'flex'; //loading screen to load all the messages in that room
            
            document.querySelector('div.channels button.selected').classList.remove('selected');
            clickedOn.classList.add('selected');

            // On mobile or small devices they burger menu will be open when they change a room
            // need to close it
            if (burgerBar.classList.contains('open')) {
                burgerBar.classList.remove('open');
                menuList.classList.remove('show');
            }//if()

            // update the room to listen for new messages
            let room = clickedOn.getAttribute('id');
            chatObj.updateRoom(room);

            // keeping track of the lastroom the user visited
            document.querySelector('section.chat-area h2 span.room-name').innerHTML = `(#${room})`;
            localStorage.setItem('room', room);

            //clear the html chats from the previous room and update the chats to the chats of the new room
            chatArea.innerHTML = '';
            updateUI();
        

            //remove loading screen
            document.querySelector('div.main-chat-area div#overlay').style.display = 'none'; 

           
        }//if()
    
    });// addEventListener()

}//changeRoom()

//=======================================================================
// This function handles sending the chat message to the db
const sendChat = () => {

    chatForm.addEventListener('submit', e => {

        e.preventDefault();

        if(textArea.value.trim().length !== 0) { // want to make sure there is an actual message to be sent 

            chatObj.addNewChat(textArea.value.trim().replace(/<[^>]*>/g ,"")); // remove an tags the user may have typed 
            chatForm.reset();
            chatForm.querySelector('button').setAttribute('disabled', true);
        }

    });//addEventListener()

}//sendChat()


//=======================================================================
// This function handles when a user is typing
// The idea is to put all the load on the front end and not the backend
// When a key is pressed:
//     - Check if there's an existing timer - stop it if there is one
//     - start a timer.
// When the timer expires, call the server method.

const isTyping = () => {

    let timeOut;
    let userIsTyping = false;

    textArea.addEventListener('keyup', () => {

        if (textArea.value.trim().length !== 0) {

            chatForm.querySelector('button').removeAttribute('disabled');
            
            if(!timeOut) { // if we there isn't a timer
        
                chatObj.setTypingStatus(true); //update their status first so it can show on the page
                userIsTyping = true;

                //once timer expires, call update their status 
                timeOut = setTimeout(() => {

                    chatObj.setTypingStatus(false);
                    timeOut = undefined;
                    userIsTyping = false;

                }, 3500);

            }

            else{ // if there is a timer
            
                clearTimeout(timeOut); 

                timeOut = setTimeout(() => {
                    chatObj.setTypingStatus(false);
                    timeOut = undefined;
                    userIsTyping = false;

                }, 3500);

            }//if-else

        }
        else if (!chatForm.querySelector('button').hasAttribute('disabled')) {
            //keep send button disabled till the user types a character
            chatForm.querySelector('button').setAttribute('disabled', true);

        }//if-else if

    });//addEventListener()

    // If your user reloads or leaves the page is the problem and they were typing. Then they aren't typing, but the timeout won't trigger.
    // To handle this, I will show an alert letting them know their unfinished message won't be saved and set their typing status to false

    onbeforeunload = function () {
        if (!userIsTyping) {
            return;
        }

        chatObj.setTypingStatus(false);
        return "Your changes may not be saved";
    };//onbeforeunload()

}//isTyping()

//=======================================================================
// This function displays the users that are typing to the user
const displayUsersTyping = () => {

    chatObj.listenToTypingChanges(usersTyping => {

        let typingText = document.querySelector('p#typing');


        if (usersTyping.length >= 3) {
            typingText.innerHTML = 'several people are typing';
        }
        else if (usersTyping.length === 2) {
            typingText.innerHTML = `${usersTyping[0]} and ${usersTyping[1]}  is typing`;
        }
        else if (usersTyping.length === 1) {
            typingText.innerHTML = `${usersTyping[0]} is typing`;
        }
        else {
            typingText.innerHTML = '';

        }//if - else if - else if - else

    });//listenToTypingChanges
    
}//displayUsersTyping()

//=======================================================================
// this function sets up everything after the user has been fully logged in
const start = chatroom => {

    if (!chatroom && typeof (chatroom) !== 'object') {
        throw new Error("You must pass in a chat object in order to run program successfully ");
    }

    chatObj = chatroom;

    updateUI();
    modifyChat();
    deleteChat();
    sendChat();
    changeRoom();
    isTyping();

}//start()





