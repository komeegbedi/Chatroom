const menuList = document.querySelector('.interest');
const chatForm = document.querySelector('div.chat-box form');
const textArea = chatForm.querySelector('textarea');
const chatArea = document.querySelector('div.main-chat-text');
const registerForm = document.querySelector('div.start-scren#overlay form');
const userInput = document.querySelector('div.start-scren#overlay form input');
const errorOutput = registerForm.querySelector('p.output');
const loadingGif = document.querySelector('div.start-scren#overlay form button img');
const regEx = /((?!^\d+$))(?=^[a-zA-Z0-9]{4,10}$).*$/;
const myModal = new bootstrap.Modal(document.getElementById('staticBackdrop'));
const burgerBar = document.querySelector('div#nav-icon3');
const users = db.collection('users');

let chat0bj;
let deleteID;
let userID;


const detectUrl = message => {
    let urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;

    message = message.replace(urlRegex, (url) => {
        let hyperlink = url;
        if (!hyperlink.match('^https?:\/\/')) {
            hyperlink = 'http://' + hyperlink;
        }
        return `<a href="${hyperlink}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });

    return message;
}

const modifyChat = () =>{

    let initalText;

    chatArea.addEventListener('click', e => {

        let parentTag = e.target.parentNode.parentNode;

        if (e.target.classList.contains('edit')) {

            let chatText = parentTag.querySelector('p');
            
            initalText = chatText.innerHTML;

            let text = chatText.innerHTML.replace(/<[^>]*>/g, tag => { // find tags in string

                if (tag.match('<br\s*\/?>')){ // if tags are <br>
                    return "\n";
                }
                else if (tag.match(/<a [^>]+>([^<]+)<\/a>/)){ // if tags are anchor tag
                    return tag.match(/<a [^>]+>([^<]+)<\/a>/)[1];
                }

                return "";
            });

            let editInput = `
                <textarea class"edit-input" style="height:${chatText.offsetHeight * 2}px" spellcheck="true" autocapitalize="off" autocomplete="off">${text.trim()}</textarea>
                `;
            let links = parentTag.querySelectorAll('div.modify a');
            parentTag.childNodes[1].insertAdjacentHTML('afterend', editInput);
            chatText.remove();
            links[0].innerHTML = 'Cancel';
            links[0].setAttribute('class', 'cancel');
            links[1].innerHTML = 'Save';
            links[1].setAttribute('class', 'save');
            links[1].removeAttribute('data-bs-target');
            links[1].removeAttribute('data-bs-toggle')

        }

        else if (e.target.classList.contains('delete')) {
            deleteID = parentTag.getAttribute('id');
        }

        else if (e.target.classList.contains('cancel')) {

            let html = `<p class="usertext">${initalText}</p>`;
            parentTag.childNodes[1].insertAdjacentHTML('afterend', html);
            parentTag.querySelector('textarea').remove();
            let links = parentTag.querySelectorAll('div.modify a');
            links[0].innerHTML = 'Edit';
            links[0].setAttribute('class', 'edit');
            links[1].innerHTML = 'Delete';
            links[1].setAttribute('class', 'delete');
            links[1].setAttribute('data-bs-target', '#staticBackdrop');
            links[1].setAttribute('data-bs-toggle', 'modal');
        }

        else if (e.target.classList.contains('save')){

            let newText = parentTag.querySelector('textarea').value.trim().replace(/<[^>]*>/g, ""); // remove any tag the user may typed
            newText = newText.replace(/(?:\r\n|\r|\n)/g, ' <br>');
            let html;

            chat0bj.isEdited(parentTag.getAttribute('id')).then(isEdited => {

                if (newText.length !== 0 && newText.localeCompare(initalText) !== 0) {

                    chat0bj.updateMessage(newText, parentTag.getAttribute('id'));
                    html = `<p class="usertext">${detectUrl(newText)}</p>`;

                    if(!isEdited)
                        html += `<span class="edited">(edited)</span>`;
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
}

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

    textArea.addEventListener('keyup', () => {

        let timeOut;
        if (textArea.value.trim().length !== 0) {
            chatForm.querySelector('button').removeAttribute('disabled');
        }
        else if (!chatForm.querySelector('button').hasAttribute('disabled')) {
            chatForm.querySelector('button').setAttribute('disabled', true);
        }
    });
}

const start = () =>{

    isTyping();

    document.querySelector('button#delete').addEventListener('click' , ()=> {

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
        },3000);

    });

    document.querySelector('button#close').addEventListener('click', () => {
        deleteID = undefined;
    });

    document.querySelector('div.start-scren#overlay').style.display ="none";

    modifyChat();
    updateUI();
    sendChat();
    changeRoom();
}


const registerUser = () =>{

    registerForm.addEventListener('submit', e => {

        e.preventDefault();
        let name = userInput.value.trim();

        if (!name.match(regEx)) {
            errorOutput.innerHTML = "Please follow the guidelines listed below!";
            errorOutput.style.display = "block";
        }
        else {

            loadingGif.style.display = "inline";

            let found = false;

            users.get().then(snapshot => {

                for (let index = 0; index < snapshot.docs.length && !found; index++) {
                    let nameInDb = snapshot.docs[index].data().name.toLowerCase();
                    found = nameInDb.localeCompare(name.toLowerCase()) === 0;
                }

                if (found) {
                    errorOutput.innerHTML = "Username is not available";
                    errorOutput.style.display = "block";
                }
                else {
                    users.add({ 
                        name,
                        isTyping: false

                    }).then(docRef => {
                        userID = docRef.id
                    });

                    chat0bj = new Chat(name, 'general' , userID);
                    localStorage.setItem('name', name);
                    localStorage.setItem('room', 'general');
                    localStorage.setItem('ID' , userID);
                    start();
                }

                loadingGif.style.display = "none";

            }).catch(err => {
                console.log(err);
            });

        }
    });
}






