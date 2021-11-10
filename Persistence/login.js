//--------------------------------------
//AUTHOR: KOME EGBEDI
//PURPOSE: This program handles logging the user in 
//-----------------------------------

const users = db.collection('users');
let chat0bj;


//=======================================================================
// This function checks if the user has been registered before (if a user has been registered, their id and username is stored in local storage)
// if the user has been registered previously, we take them to the previous room they were before and don't show the registration screen

const verifyUser = () => {

    const loadingScreen = document.querySelector('div.loading-screen#overlay');

    loadingScreen.style.display = "block";

    //get all the stored info in local storage(if there is one)
    let userName = localStorage.getItem('name');
    let lastroom = localStorage.getItem('room');
    let ID = localStorage.getItem('ID');

    // if we are unable to find an userName or the user has manipulated their username from the console to not fit the guidelines of the username 
    // we ask them to register again 
    if (!userName || !userName.match(regEx) ) {
        registerUser();
        loadingScreen.style.display = "none";
    }

    // if we were able to find a userName but no an ID (the user could have deleted it from the console), 
    // we want to check the db for the ID as usernmes are also unique
    else if (!ID) { 

        users.get().then(snapshot => {

            let data = snapshot.docs;

            for (let index = 0; index < data.length && !ID; index++) {

                if (data[index].data().name.localeCompare(userName) === 0) {
                    ID = data[index].id;
                }
            }

            //if we found the username, we login the user and save their details
            // else we ask the user to register
            if (ID) {
                localStorage.setItem('ID', ID);
                logUserIn(userName, lastroom, ID);
            }
            else {
                registerUser();
            }

            loadingScreen.style.display = "none";
        });//then()

    }

    // if we found all the details (username and ID) , we check if the ID is valid
    // if not valid, the user will have to register
    else { 

        users.doc(ID).get().then(doc => {

            if (doc.exists) {
                logUserIn(userName, lastroom, ID);
            }
            else {
                registerUser();
            }//if-else

            loadingScreen.style.display = "none";

        });//then()

    }//end if-else

    userID = ID;

}//verifyUser


//=======================================================================
//This function registers a new user 
const registerUser = () => {

    const registerForm = document.querySelector('div.start-scren#overlay form');
    const errorOutput = registerForm.querySelector('p.output');
    const userInput = document.querySelector('div.start-scren#overlay form input');
    const loadingGif = document.querySelector('div.start-scren#overlay form button img');

    document.querySelector('div.start-scren#overlay').style.display = "block"; 

    const regEx = /((?!^\d+$))(?=^[a-zA-Z0-9]{4,10}$).*$/; // ensure that the user name does not contain any special characters, 
                                                         // does not contain only numbers and are between 4-10 characters


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

            users.get().then(snapshot => { // check if the username already exists in the db, as usernames are meant to be unique

                for (let index = 0; index < snapshot.docs.length && !found; index++) {

                    let nameInDb = snapshot.docs[index].data().name.toLowerCase();
                    found = nameInDb.localeCompare(name.toLowerCase()) === 0;
                }

                if (found) {
                    errorOutput.innerHTML = "Username is not available";
                    errorOutput.style.display = "block";
                }
                else {
                    //if username isn't already in the db, add the user to the db then login the user in
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
                    
                }//if-else

                loadingGif.style.display = "none";

            }).catch(err => {
                console.log(err);
            });

        }//if-else

    });//eventListener()

}//registerUser()


//=======================================================================
//this function logs the user in after verifying the user
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
}//logUserIn()

verifyUser();