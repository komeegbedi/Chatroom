//--------------------------------------
// AUTHOR: KOME EGBEDI
// PURPOSE: This file handles mofificataion the design(look or feel) of the webpage (i.e dark or light mode, open or close navabar )
//-----------------------------------

const checkBox = document.getElementById("switch");
const loadingGif = document.querySelector('div.start-scren#overlay form button img');


//=======================================================================
const activateDarkMode = () => {
    document.body.classList.add('dark-mode');
    loadingGif.src = 'assets/loading-dark.gif';
    checkBox.checked = true;
}


//=======================================================================
const activateLightMode = () => {

    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        checkBox.checked = false;
    }

    loadingGif.src = 'assets/loading-light.gif';
}
 

//=======================================================================
const openMenu = () => {

    const burgerMenu = document.querySelector('.burger-menu');
    const burgerBar = document.querySelector('div#nav-icon3');
    const menuList = document.querySelector('.interest');
    
    burgerMenu.addEventListener('click', () => {
        burgerBar.classList.toggle('open');
        menuList.classList.toggle('show');
    });
}


//=======================================================================
const main = () => {

    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isLightMode = window.matchMedia("(prefers-color-scheme: light)").matches;
    const isNotSpecified = window.matchMedia("(prefers-color-scheme: no-preference)").matches;
    const hasNoSupport = !isDarkMode && !isLightMode && !isNotSpecified;
   

    if (isDarkMode) {
        activateDarkMode();
    }

    if (isLightMode) {
        activateLightMode();
    }
  
    if (isNotSpecified || hasNoSupport) {

        console.log('You specified no preference for a color scheme or your browser does not support it. I schedule dark mode during night time.');
    
        let hour = new Date().getHours();

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
        }//if-else

    });
    openMenu();
}

main();