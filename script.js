const checkBox = document.getElementById("switch");
const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
const isLightMode = window.matchMedia("(prefers-color-scheme: light)").matches;
const isNotSpecified = window.matchMedia("(prefers-color-scheme: no-preference)").matches;
const hasNoSupport = !isDarkMode && !isLightMode && !isNotSpecified;


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


