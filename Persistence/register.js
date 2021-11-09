const users = db.collection('users');

const registerUser = () => {

    document.querySelector('div.start-scren#overlay').style.display = "block";
    const regEx = /((?!^\d+$))(?=^[a-zA-Z0-9]{4,10}$).*$/;

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

                        userID = docRef.id;
                        chat0bj = new Chat(name, 'general', userID);
                        localStorage.setItem('name', name);
                        localStorage.setItem('room', 'general');
                        localStorage.setItem('ID', userID);
                        start();
                        document.querySelector('div.start-scren#overlay').style.display = "none";

                    });
                }

                loadingGif.style.display = "none";

            }).catch(err => {
                console.log(err);
            });

        }
    });
}



const verifyUser = () => {

    const loadingScreen = document.querySelector('div.loading-screen#overlay');

    loadingScreen.style.display = "block";

    let userName = localStorage.getItem('name');
    let lastroom = localStorage.getItem('room');
    let ID = localStorage.getItem('ID');

    if (!userName || !userName.match(regEx)) {
        registerUser();
        loadingScreen.style.display = "none";
    }
    else if (!ID) {

        users.get().then(snapshot => {

            let data = snapshot.docs;

            for (let index = 0; index < data.length && !ID; index++) {
                if (data[index].data().name.localeCompare(userName) === 0) {
                    ID = data[index].id;
                }
            }

            if (ID) {
                localStorage.setItem('ID', ID);
                logUserIn(userName, lastroom, ID);
            }
            else {
                registerUser();
            }
            loadingScreen.style.display = "none";
        });
    }
    else {

        users.doc(ID).get().then(doc => {

            if (doc.exists) {
                logUserIn(userName, lastroom, ID);
            }
            else {
                registerUser();
            }

            loadingScreen.style.display = "none";

        });
    }

    userID = ID;
}

const logUserIn = (userName, lastroom, ID) => {

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