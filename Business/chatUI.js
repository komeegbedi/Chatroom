const menuList = document.querySelector('.interest');
const chatForm = document.querySelector('div.chat-box form');
const textArea = chatForm.querySelector('textarea');
const chatArea = document.querySelector('div.main-chat-text');
const registerForm = document.querySelector('div.start-scren#overlay form');
const userInput = document.querySelector('div.start-scren#overlay form input');
const errorOutput = registerForm.querySelector('p.output');
const loadingGif = document.querySelector('div.start-scren#overlay form button img');
const myModal = new bootstrap.Modal(document.getElementById('staticBackdrop'));
const burgerBar = document.querySelector('div#nav-icon3');

let chat0bj;
let deleteID;
let userID;
let unsubscribeTypingChanges;

// This function handles the modification of messages (edit or delete a message)
const modifyChat = () => {

    //TODO: chcek on delete and save 

    let initalText; // this variable stores the text that was initially saved so we don't loose track of it

    chatArea.addEventListener('click', e => {

        let parentTag = e.target.parentNode.parentNode;

        if (e.target.classList.contains('edit')) { // editing messages 

            //get the paragraph the user wants to edit and get the text from the paragraph
            let chatText = parentTag.querySelector('p');
            initalText = chatText.innerHTML;

            //the innerHTML from the paragraph will also return the tags that we embedded in the text 
            // when a user is trying to edit a message, we want to strip out all the tags embeded in the paragraph
            // and show them plain text (basically exactly how they typed it at the beginning)

            let text = chatText.innerHTML.replace(/<[^>]*>/g, tag => { 

                // there are only two tags we injected which are the <br> tag and the <a> tag 
                // an other tag was added by the user 

                if (tag.match('<br\s*\/?>')) {  //for <br> tags we want to replace that with a newline character 
                    return "\n";
                }
                else if (tag.match(/<a [^>]+>([^<]+)<\/a>/)) { // for <a> tags we just want to display to the user, the text between the tags <a>
                    return tag.match(/<a [^>]+>([^<]+)<\/a>/)[1];
                }

                return ""; // for another tags we user may have typed in, we want to ignore it and return an empty string

            }); // end replace 
            
            //users are going to be able to edit their text from a textarea 
            
            let editInput = `
                <textarea class"edit-input" style="height:${chatText.offsetHeight * 2}px" spellcheck="true" autocapitalize="off" autocomplete="off">${text.trim()}</textarea>
                `;
            
            // we want to replace the paragraph with the text area (the text area will be at the position the paragraph being editted was)
            let links = parentTag.querySelectorAll('div.modify a');
            parentTag.childNodes[1].insertAdjacentHTML('afterend', editInput);
            chatText.remove();

            // the modification buttons will also have to be changed as well
            links[0].innerHTML = 'Cancel';
            links[0].setAttribute('class', 'cancel');
            links[1].innerHTML = 'Save';
            links[1].setAttribute('class', 'save');
            links[1].removeAttribute('data-bs-target');
            links[1].removeAttribute('data-bs-toggle')

        }//if 

        else if (e.target.classList.contains('delete')) { // deleting messages

            deleteID = parentTag.getAttribute('id');
        }

        else if (e.target.classList.contains('cancel')) { // this  is only possible after a user clicks the edit button and change their mind about editing the message

            //replace the textarea tag back to the paragraphy tag
            let html = `<p class="usertext">${initalText}</p>`;
            parentTag.childNodes[1].insertAdjacentHTML('afterend', html);
            parentTag.querySelector('textarea').remove();
            let links = parentTag.querySelectorAll('div.modify a');

            //the modification buttons will be changed 
            links[0].innerHTML = 'Edit';
            links[0].setAttribute('class', 'edit');
            links[1].innerHTML = 'Delete';
            links[1].setAttribute('class', 'delete');
            links[1].setAttribute('data-bs-target', '#staticBackdrop');
            links[1].setAttribute('data-bs-toggle', 'modal');
        }

        else if (e.target.classList.contains('save')) { // this is only possible after a user has clicked on edit and they want to save their changes 

            let newText = parentTag.querySelector('textarea').value.trim().replace(/<[^>]*>/g, ""); // we want to filter an tag they user may have typed in
            newText = newText.replace(/(?:\r\n|\r|\n)/g, ' <br>');  //replace all new line characters with the <br> tag

            let html;
            chat0bj.isEdited(parentTag.getAttribute('id')).then(isEdited => {

                if (newText.length !== 0 && newText.localeCompare(initalText) !== 0) {

                    chat0bj.updateMessage(newText, parentTag.getAttribute('id'));
                    html = `<p class="usertext">${detectUrl(newText)}</p>`;

                    if (!isEdited){
                        html += `<span class="edited">(edited)</span>`;
                    }
                }
                else {
                    html = `<p class="usertext">${initalText}</p>`;
                }

                parentTag.childNodes[1].insertAdjacentHTML('afterend', html);
                parentTag.querySelector('textarea').remove();
                let links = parentTag.querySelectorAll('div.modify a');
                links[0].innerHTML = 'Edit';
                links[0].setAttribute('class', 'edit');
                links[1].innerHTML = 'Delete';
                links[1].setAttribute('class', 'delete');
                links[1].setAttribute('data-bs-target', '#staticBackdrop');
                links[1].setAttribute('data-bs-toggle', 'modal');


            }).catch(err => console.log(err));

        }

    });
}//modifyChat()

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
        }
        return `<a href="${hyperlink}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });

    return message;
}//detectUrl()

//This function updates the UI when ever there is any change with the messages (new messages , editted messages , deleted messages)
const updateUI = () =>{
    
    chat0bj.getChats((chat , changeType , ID) =>{

        let chatBubble;
      
       if(changeType === 'added'){

           let message = detectUrl(chat.message);
           let format;

           if (dateFns.isToday(chat.sent_at.toDate())){
               format = 'h:mm a';
           }
           else if (chat.sent_at.toDate().getFullYear() !== new Date().getFullYear()){
               format = 'MMM Do, YYYY h:mm a';
           }
           else{
               format = 'ddd, MMM Do h:mm a';
           }
          
            chatBubble = `
                        <div class="user-chat" id ="${ID}">
                                <h3 class="username">
                                    ${chat.username} 
                                    <span class="time">${
                                        dateFns.format(
                                            chat.sent_at.toDate(), 
                                            format, 
                                            {
                                                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                                            }
                                        )
                                    }</span>
                                </h3>
                                <p class="usertext">${message}</p>`;

        
           if (chat.isEdited){
                chatBubble += `<span class="edited">(edited)</span>`;
            }
            
            if(chat.username.localeCompare(chat0bj.getName()) === 0){

                  chatBubble +=  `<div class="modify">
                                        <a href="#" class="edit">Edit</a>
                                        <a href="#" class="delete" data-bs-toggle="modal" data-bs-target="#staticBackdrop">Delete</a>
                                    </div>`;
            }

            chatBubble += `</div>`;

            chatArea.innerHTML += chatBubble;
            let newChat = document.getElementById(ID);
            chatArea.scrollTo({ top: newChat.offsetTop , left: newChat.offsetLeft, behavior: 'smooth' });

       }
       else if (changeType === 'removed'){
           document.getElementById(ID).remove();
       }

    });
}

const changeRoom = () =>{

    document.querySelector('div.channels').addEventListener('click' , e =>{
        let clickedOn;

        if (e.target.tagName === 'BUTTON'){
            clickedOn = e.target;
        }
        else if (e.target.parentNode.tagName === 'BUTTON'){
            clickedOn = e.target.parentNode;
        }

        if(clickedOn){

            document.querySelector('div.main-chat-area div#overlay').style.display = 'flex';
            
            document.querySelector('div.channels button.selected').classList.remove('selected');
            clickedOn.classList.add('selected');


            if (burgerBar.classList.contains('open')) {
                burgerBar.classList.remove('open');
                menuList.classList.remove('show');
            }

            let room = clickedOn.getAttribute('id');
            chat0bj.updateRoom(room);
            document.querySelector('section.chat-area h2 span.room-name').innerHTML = `(#${room})`;
            localStorage.setItem('room', room);
            chatArea.innerHTML = '';
            updateUI();
            document.querySelector('div.main-chat-area div#overlay').style.display = 'none';

            if (unsubscribeTypingChanges){
                unsubscribeTypingChanges();
                listenToTypingChanges();
            }
        }
    
    });
}

const sendChat = () => {

    chatForm.addEventListener('submit', e => {
        e.preventDefault();

        if(textArea.value.trim().length !== 0){
            chat0bj.addNewChat(textArea.value.trim().replace(/<[^>]*>/g ,""));
            chatForm.reset();
            chatForm.querySelector('button').setAttribute('disabled', true);
        }

    });
}

const isTyping = () => {

    let timeOut;
    let userIsTyping = false;
    textArea.addEventListener('keyup', () => {

        if (textArea.value.trim().length !== 0) {

            chatForm.querySelector('button').removeAttribute('disabled');
            
            if(!timeOut){
                users.doc(userID).update({isTyping:true});
                userIsTyping = true;

                timeOut = setTimeout(() => {
                    users.doc(userID).update({ isTyping: false });
                    timeOut = undefined;
                    userIsTyping = false;
                }, 5000);
            }
            else{
            
                clearTimeout(timeOut);

                timeOut = setTimeout(() => {
                    users.doc(userID).update({ isTyping: false });
                    timeOut = undefined;
                    userIsTyping = false;

                }, 5000);
            }
        }
        else if (!chatForm.querySelector('button').hasAttribute('disabled')) {
            chatForm.querySelector('button').setAttribute('disabled', true);
        }
    });

 
    listenToTypingChanges();
    onbeforeunload = function () {
        if (!userIsTyping) {
            return;
        }

        users.doc(userID).update({ isTyping: false });
        return "Your changes may not be saved";
    };
}

const listenToTypingChanges = () => {

    let usersTyping = [];
    let typingText = document.querySelector('p#typing');

    unsubscribeTypingChanges = users
    .where('currentRoom', '==', chat0bj.getRoom())
    .where('name' , '!=', chat0bj.getName())
    .onSnapshot(snapshot => {

        usersTyping = [];
        snapshot.docChanges().forEach(change => {

            let data = change.doc.data();
            if (change.type === 'modified' && data.isTyping) {
                usersTyping.push(data.name);
            }
        });

        if(usersTyping.length >= 3){
            typingText.innerHTML = 'several people are typing';
        }
        else if (usersTyping.length === 2){
            typingText.innerHTML = `${usersTyping[0]} and ${usersTyping[1]}  is typing`;
        }
        else if (usersTyping.length === 1){
            typingText.innerHTML = `${usersTyping[0]} is typing`;
        }
        else{
            typingText.innerHTML = '';
        }
        
    });
}


const start = () => {

    isTyping();


    //TODO: WHY ??
    document.querySelector('button#delete').addEventListener('click', () => {

        if (deleteID) {
            chat0bj.deleteMessage(deleteID);
            deleteID = undefined;
        }

        myModal.hide();

        let notification = `
                 <div class="alert alert-success" role="alert">
                  Your message was successfully deleted
                </div>`;

        document.querySelector('section.chat-area.grid > div:nth-child(2)').insertAdjacentHTML("afterbegin", notification);

        setTimeout(() => {
            document.querySelector('section.chat-area.grid > div:nth-child(2) div.alert-success').remove();
        }, 3000);

    });

    document.querySelector('button#close').addEventListener('click', () => {
        deleteID = undefined;
    });

    modifyChat();
    updateUI();
    sendChat();
    changeRoom();
}





