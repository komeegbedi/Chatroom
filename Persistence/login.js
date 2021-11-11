//--------------------------------------
// AUTHOR: KOME EGBEDI
// PURPOSE: This program handles logging the user in 
//-----------------------------------

const users = db.collection('users');
const validUserName = /((?!^\d+$))(?=^[a-zA-Z0-9]{4,10}$).*$/; // ensure that the user name does not contain any special characters, 
                                                         // does not contain only numbers and are between 4-10 characters


//=======================================================================
// This function checks if the user has been registered before (if a user has been registered, their id and username is stored in local storage)
// if the user has been registered previously, we take them to the previous room they were before and don't show the registration screen

const verifyUser = () => {

    const loadingScreen = document.querySelector('div.loading-screen#overlay');

    loadingScreen.style.display = "block";

    //get all the stored info in local storage(if there is one)
    let userName = localStorage.getItem('name');
    let lastroom = localStorage.getItem('room');
    let userID = localStorage.getItem('ID');

    // if we are unable to find an userName or the user has manipulated their username from the console to not fit the guidelines of the username 
    // we ask them to register again 

    // you may notice that " {loadingScreen.style.display = "none"} " is repeated multiple times, that's because  the functions called in the if -else if - else statements 
    // are async functions meaning they will take time to finish executing and I want the loading screen to be there as long there are things loading

    if (!userName || !userName.match(validUserName) ) {
        registerUser();
        loadingScreen.style.display = "none";
    }

    // if we were able to find a userName but no an ID (the user could have deleted it from the console), 
    // we want to check the db for the ID as usernmes are also unique
    else if (!userID) { 

        users.get().then(snapshot => {

            let data = snapshot.docs;

            for (let index = 0; index < data.length && !userID; index++) {

                if (data[index].data().name.localeCompare(userName) === 0) {
                    userID = data[index].id;
                }
            }

            //if we found the username, we login the user and save their details
            // else we ask the user to register
            if (userID) {
                localStorage.setItem('ID', userID);
                logUserIn(userName, lastroom, userID);
            }
            else {
                registerUser();
            }

            loadingScreen.style.display = "none";
        });//then()

    }

    // if we found all the details (username and userID) , we check if the userID is valid
    // if not valid, the user will have to register
    else { 

        users.doc(userID).get().then(doc => {

            if (doc.exists) {
                logUserIn(userName, lastroom, userID);
            }
            else {
                registerUser();
            }//if-else

            loadingScreen.style.display = "none";

        });//then()

    }//end if-else

}//verifyUser


//=======================================================================
//This function registers a new user 
const registerUser = () => {

    const registerForm = document.querySelector('div.login-screen form');
    const errorOutput = registerForm.querySelector('p.output');
    const userInput = document.querySelector('div.login-screen form input');
    const loadingGif = document.querySelector('div.login-screen form button img');
    const loginScreen = document.querySelector('div.login-screen');

    loginScreen.style.display = "block";

    registerForm.addEventListener('submit', e => {

        e.preventDefault();
        let name = userInput.value.trim();

        if (!name.match(validUserName)) {

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

                        localStorage.setItem('name', name);
                        localStorage.setItem('room', 'general');
                        localStorage.setItem('ID', docRef.id);
                       
                        logUserIn(name, 'general', docRef.id);

                        
                        loginScreen.style.display = "none";

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

    document.querySelector('section.chat-area h2 span.room-name').innerHTML = `(#${lastroom})`;
    document.querySelector('div.channels button.selected').classList.remove('selected');
    document.querySelector(`div.channels button#${lastroom}`).classList.add('selected');
    start(new Chat(userName, lastroom, ID));

}//logUserIn()

verifyUser();