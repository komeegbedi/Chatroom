const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
const isLightMode = window.matchMedia("(prefers-color-scheme: light)").matches;
const isNotSpecified = window.matchMedia("(prefers-color-scheme: no-preference)").matches;
const hasNoSupport = !isDarkMode && !isLightMode && !isNotSpecified;
const checkBox = document.getElementById("switch");
const burgerMenu = document.querySelector('.burger-menu');

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

    burgerMenu.addEventListener('click', () => {
        burgerBar.classList.toggle('open');
        menuList.classList.toggle('show');
    });
}

const verifyUser = () =>{

    let userName = localStorage.getItem('name');
    let lastroom = localStorage.getItem('room');
    if (!userName || !userName.match(regEx) || !lastroom) {
        registerUser();
    }
    else {
        chat0bj = new Chat(userName, lastroom);
        document.querySelector('section.chat-area h2 span.room-name').innerHTML = `(#${lastroom})`;
        document.querySelector('div.channels button.selected').classList.remove('selected');
        document.querySelector(`div.channels button#${lastroom}`).classList.add('selected');
        start();
    }
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

    verifyUser();
    openMenu();
}

main();