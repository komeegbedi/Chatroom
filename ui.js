const checkBox = document.getElementById("switch");
const burgerMenu = document.querySelector('.burger-menu');
const menuList = document.querySelector('.interest');
const chatForm = document.querySelector('form');
const textArea = chatForm.querySelector('textarea');
const chatArea = document.querySelector('div.main-chat-text');
const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
const isLightMode = window.matchMedia("(prefers-color-scheme: light)").matches;
const isNotSpecified = window.matchMedia("(prefers-color-scheme: no-preference)").matches;
const hasNoSupport = !isDarkMode && !isLightMode && !isNotSpecified;
const chat0bj = new Chat('kome', 'general');


const activateDarkMode = () => {
    document.body.classList.add('dark-mode');
    checkBox.checked = true;
}

const activateLightMode = () => {

    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        checkBox.checked = false;
    }

}

const openMenu = () => {

    const burgerBar = document.querySelector('div#nav-icon3');
    
    burgerMenu.addEventListener('click', () => {
        burgerBar.classList.toggle('open');
        menuList.classList.toggle('show');
    });
}

const modifyChat = () =>{

    let initalText;

    chatArea.addEventListener('click', e => {

        let parentTag = e.target.parentNode.parentNode;

        if (e.target.classList.contains('edit')) {

            let chatText = parentTag.querySelector('p');
            let text = chatText.innerHTML;
            initalText = text;
            let editInput = `<textarea class"edit-input" style="height:${chatText.offsetHeight * 2}px" >${text.trim()}</textarea>`;
            let links = parentTag.querySelectorAll('div.modify a');
            parentTag.childNodes[1].insertAdjacentHTML('afterend', editInput);
            chatText.remove();
            links[0].innerHTML = 'Cancel';
            links[0].setAttribute('class', 'cancel');
            links[1].innerHTML = 'Save';
            links[1].setAttribute('class', 'save');

        }
        else if (e.target.classList.contains('delete')) {
            //add question if they want to delete
            chat0bj.deleteMessage(parentTag.getAttribute('id'));
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
        }
       

    });
}

const updateUI = () =>{
    
    let chatBubble;

    chat0bj.getChats((chat , changeType , ID) =>{
      
       if(changeType === 'added'){
            chatBubble = `
                        <div class="user-chat" id ="${ID}">
                                <h3 class="username">${chat.username}</h3>
                                <p class="usertext">${chat.message}</p>
                                <div class="modify">
                                    <a href="#" class="edit">Edit</a>
                                    <a href="#" class="delete">Delete</a>
                                </div>`;

        chatArea.innerHTML += chatBubble;
        let newChat = document.querySelector(`div#${ID}`);
        chatArea.scrollTo({ top: newChat.offsetTop , left: newChat.offsetLeft, behavior: 'smooth' });
        
       }
       else if (changeType === 'removed'){
            document.querySelector(`div#${ID}`).remove();
       }

    });
}

const sendChat = () => {
    chatForm.addEventListener('submit', e => {
        e.preventDefault();

        if(textArea.value.trim().length !== 0){
            chat0bj.addNewChat(textArea.value);
            chatForm.reset();
            chatForm.querySelector('button').setAttribute('disabled', true);
        }
    });
}

const main = () => {

    if (isDarkMode) {
        activateDarkMode();
    }

    if (isLightMode) {
        activateLightMode();
    }

    if (isNotSpecified || hasNoSupport) {

        console.log('You specified no preference for a color scheme or your browser does not support it. I schedule dark mode during night time.')
        now = new Date();
        hour = now.getHours();
        if (hour < 4 || hour >= 16) {
            activateDarkMode();
        }
    }

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => e.matches && activateDarkMode());
    window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", e => e.matches && activateLightMode());

    checkBox.addEventListener('change', function () {
        document.body.classList.toggle('dark-mode');
    });


    textArea.addEventListener('keyup' , ()=> {

        if(textArea.value.trim().length !== 0){
            chatForm.querySelector('button').removeAttribute('disabled');
        }
        else if (!chatForm.querySelector('button').hasAttribute('disabled')){
            chatForm.querySelector('button').setAttribute('disabled' , true);
        }
       
    });

    openMenu();
    modifyChat();
    updateUI();
    sendChat();
}

main();



