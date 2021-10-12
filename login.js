


window.onload = () => {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
        .register("/serviceWorker.js")
        .then(res => console.log("service worker registered"))
        .catch(err => console.log("service worker not registered", err));
    }

    if (Notification.permission != 'granted'){
        Notification.requestPermission(function(status) {
            console.log('Notification permission status:', status);
            displayNotification('Notifications Enabled', 'Matcha will now notify you of calendar events.');
        });
    } else {
        console.log('Notifications previously granted.');
        //displayNotification('Notifications Enabled', '', null, null, 'https://jaysontian.com');
    }
}
navigator.serviceWorker.addEventListener('message', event => console.log(event.data));

function displayNotification(title, body, scheduled, id, link) {
  if (Notification.permission == 'granted') {
    navigator.serviceWorker.getRegistration().then(function(reg) {
        var timestamp;
        if (title == null || title == ''){
            title = "Untitled Event"
        }
        if (scheduled != null) {
            timestamp = scheduled;
        } else {
            timestamp = new Date().getTime(); // now plus 5000ms
        }
        if (!id) {id = Date.now()}
        var options = {
            tag: id, // a unique ID
            body: body,
            requireInteraction: true,
            icon: 'images/logo.png',
            badge: 'images/logo.png',
            vibrate: [100, 50, 100],
            showTrigger: new TimestampTrigger(timestamp),
            data: {
                link: link,
                dateOfArrival: Date.now(),
                primaryKey: 1,
                url: window.location.href,
                id: id,
                date: timestamp
            },
        };
        reg.showNotification(title, options);
    });
  }
}


var firebaseConfig = {
    apiKey: "AIzaSyD1YBSA5DcwjK92qsMeiYturKLA1Q2EQdw",
    authDomain: "matcha-82995.firebaseapp.com",
    projectId: "matcha-82995",
    storageBucket: "matcha-82995.appspot.com",
    messagingSenderId: "167793790051",
    appId: "1:167793790051:web:70537a57f4af22fd1b3c56",
    measurementId: "G-V0FTX11XTB"
};
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();
var provider = new firebase.auth.GoogleAuthProvider();
var signedin = false;
var initsnap = false;
var data;

$('#signin').click(()=>{ 
    firebase.auth().signInWithRedirect(provider)
    .then((result) => {
        var credential = result.credential;
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = credential.accessToken;
        var user = result.user;
    }).catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
    });
});

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        signedin=true;
        var profile = firebase.auth().currentUser;
        showPage('.app-con');
        /*$('#name').text(profile.displayName);
        $('#image').attr('src', profile.photoURL);
        $('.profile').css('opacity','1');

    */  db.collection("users").doc(profile.uid).onSnapshot((doc) => {
            var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
            if (source == 'Server' && initsnap){
                data = doc.data();
                refresh();
            }
        });

        db.collection("users").doc(firebase.auth().currentUser.uid).get().then(doc => {
            if (doc.exists) {
                data = doc.data();
                if (!data.cog){data.cog={};}
                init();
            } else {
                data = {
                    cog: {
                        desktop_notif:true,
                        alert_before: 10, // in minutes 
                    }
                };
                init();
            };
            rendercog();
        });
    } 
    
    else {
        signedin=false;
        data = {};
        showPage('.login')
    }
});
$('#logout').click(()=>{
    firebase.auth().signOut().then(() => {
        console.log('sign out successful')
        }).catch((error) => {
    });
})

function save(){
    if (signedin){
        db.collection("users").doc(firebase.auth().currentUser.uid).set(data)
        .then(() => {
            //console.log("Document written with ID: " + firebase.auth().currentUser.uid);
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
        });
    }
}