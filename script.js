const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
const checkBox = document.getElementById("switch");

if (prefersDarkScheme.matches) {
    document.body.classList.add("dark-mode");
    checkBox.checked = true;
} 

checkBox.addEventListener('change', function () {
    document.body.classList.toggle('dark-mode');
});



