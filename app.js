
  const firebaseConfig = {
    apiKey: "AIzaSyDRqrzeQHsWOzP6RH6ne4Rh9rrKEHdNbKM",
    authDomain: "beautiful-photos-web-app.firebaseapp.com",
    databaseURL: "https://beautiful-photos-web-app-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "beautiful-photos-web-app",
    storageBucket: "beautiful-photos-web-app.appspot.com",
    messagingSenderId: "821802313922",
    appId: "1:821802313922:web:2e67be4008a0aa804a335b"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const storage = firebase.storage();
  const database = firebase.database();  // Realtime Database
  
  // Select elements
  const imageUpload = document.getElementById('imageUpload');
  const uploadButton = document.getElementById('uploadButton');
  const imageGallery = document.getElementById('imageGallery');
  
  // Function to upload image
  uploadButton.addEventListener('click', () => {
    const file = imageUpload.files[0];
    if (!file) {
      alert("Please choose an image to upload.");
      return;
    }
  
    const storageRef = storage.ref('images/' + file.name);  // Create reference
    const uploadTask = storageRef.put(file);
  
    // Track upload state
    uploadTask.on('state_changed', 
      (snapshot) => {
        // Progress tracking (optional)
      }, 
      (error) => {
        alert('Error uploading image: ' + error.message);
      }, 
      () => {
        // On successful upload
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          // Store the image URL in Realtime Database
          const newImageRef = database.ref('images').push();
          newImageRef.set({
            url: downloadURL,
            name: file.name,
            timestamp: Date.now()  // Store timestamp as number
          }).then(() => {
            alert('Image uploaded successfully');
            displayImages();  // Refresh the gallery
          }).catch((error) => {
            alert('Error saving image URL to Realtime Database: ' + error.message);
          });
        });
      }
    );
  });
  
  // Function to display images from Realtime Database
  function displayImages() {
    imageGallery.innerHTML = '';  // Clear previous images
    database.ref('images').orderByChild('timestamp').once('value', (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const img = document.createElement('img');
        img.src = childSnapshot.val().url;
        img.alt = childSnapshot.val().name;
        img.width = 200;  // Set width for images
        imageGallery.appendChild(img);
      });
    }).catch((error) => {
      console.log('Error getting images: ', error);
    });
  }
  
  // Initial display of images
  displayImages();
  