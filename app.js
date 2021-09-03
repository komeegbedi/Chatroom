const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
const isLightMode = window.matchMedia("(prefers-color-scheme: light)").matches;
const isNotSpecified = window.matchMedia("(prefers-color-scheme: no-preference)").matches;
const hasNoSupport = !isDarkMode && !isLightMode && !isNotSpecified;
const checkBox = document.getElementById("switch");
const burgerMenu = document.querySelector('.burger-menu');

const activateDarkMode = () => {
    document.body.classList.add('dark-mode');
    loadingGif.src = './assest/loading-dark.gif';
    checkBox.checked = true;
}

const activateLightMode = () => {

    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        checkBox.checked = false;
    }
    loadingGif.src = './assest/loading-light.gif';
}

const openMenu = () => {

    burgerMenu.addEventListener('click', () => {
        burgerBar.classList.toggle('open');
        menuList.classList.toggle('show');
    });
}

const verifyUser = () =>{

    const loadingScreen = document.querySelector('div.loading-screen#overlay');

    loadingScreen.style.display = "block";

    let userName = localStorage.getItem('name');
    let lastroom = localStorage.getItem('room');
    let ID = localStorage.getItem('ID');

    if (!userName || !userName.match(regEx)) {
        registerUser();
        loadingScreen.style.display = "none";
    }
    else if(!ID){

        users.get()
        .then(snapshot => {
            let data = snapshot.docs;

            for(let index = 0; index < data.length && !ID; index++){
                if (data[index].data().name.localeCompare(userName) === 0){
                    ID = data[index].id;
                }
            }

            if(ID){
                localStorage.setItem('ID' , ID);
                logUserIn(userName , lastroom , ID);
            }
            else{
                registerUser();
            }
            loadingScreen.style.display = "none";
        });
    }
    else{

        users.doc(ID)
        .get()
        .then( doc => {

            if(doc.exists){
                logUserIn(userName, lastroom, ID);
            }
            else{
                registerUser();
            }

            loadingScreen.style.display = "none";

        });
    }   

    userID = ID;

    
}

const logUserIn = (userName , lastroom,  ID ) => {

    

    if (!lastroom) {
        lastroom = 'general'
    }

    chat0bj = new Chat(userName, lastroom, ID);
    userID = ID;
    document.querySelector('section.chat-area h2 span.room-name').innerHTML = `(#${lastroom})`;
    document.querySelector('div.channels button.selected').classList.remove('selected');
    document.querySelector(`div.channels button#${lastroom}`).classList.add('selected');
    start();
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
       
        if (checkBox.checked) {
            activateDarkMode();
        }
        else {
            activateLightMode();
        }
    });

    verifyUser();
    openMenu();
}

main();