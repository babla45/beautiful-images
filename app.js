
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
  const toggleButton = document.getElementById('toggle');
  const pin = document.getElementById('pin');
  
  function check(){
    pin.style.display='block';
    if(pin.value=="1025")
      return true;
    else return false;
  }
  
  
  // Toggle delete buttons visibility
  toggleButton.addEventListener('click', () => {
    
    if(check())
    {
       const deleteButtons = document.querySelectorAll('.delete-button');
       deleteButtons.forEach(button => {
         button.classList.toggle('visible');
       });
       pin.style.display='none';
    }

  });
  
  // Function to upload images
  uploadButton.addEventListener('click', () => {
    const files = imageUpload.files;
    if (files.length === 0) {
      alert("Please choose images to upload.");
      return;
    }
  
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const storageRef = storage.ref('images/' + file.name);  // Create reference
      const uploadTask = storageRef.put(file);
  
      // Track upload state
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          document.getElementById('percent').textContent = Math.floor(progress) + ' % done';
          const progressBar = document.getElementById('progressBar');
          if (progressBar) {
            progressBar.value = progress;
          }
        },
        (error) => {
          alert('Error uploading image: ' + error.message);
          progressBar.value = 0;
        },
        () => {
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            const newImageRef = database.ref('images').push();
            newImageRef.set({
              url: downloadURL,
              name: file.name,
              timestamp: Date.now()
            }).then(() => {
              displayImages();  // Refresh the gallery
            }).catch((error) => {
              alert('Error saving image URL to Realtime Database: ' + error.message);
            });
          });
        }
      );
    }
  });
  
  // Function to delete an image
  function deleteImage(imageId) {
    const imageRef = database.ref('images/' + imageId);
    imageRef.remove()
      .then(() => {
        displayImages();  // Refresh the gallery
      })
      .catch((error) => {
        console.error('Error deleting image: ', error);
      });
  }
  
  // Function to display images from Realtime Database
  function displayImages() {
    imageGallery.innerHTML = '';  // Clear previous images
    database.ref('images').orderByChild('timestamp').once('value')
      .then((snapshot) => {
        const images = [];
        snapshot.forEach((childSnapshot) => {
          images.push({ key: childSnapshot.key, ...childSnapshot.val() });
        });
  
        // Reverse the images to have newest ones on top
        images.reverse().forEach((imageData, index) => {
          const imageKey = imageData.key;
          const imgUrl = imageData.url;
          const imgName = imageData.name;
  
          // Create image container
          const imgContainer = document.createElement('div');
          imgContainer.className = 'image-container';
          imgContainer.dataset.index = index;
  
          const img = document.createElement('img');
          img.src = imgUrl;
          img.alt = imgName;
          img.className = 'gallery-image';
  
          // Add click event for image preview
          img.addEventListener('click', () => {
            openImagePreview(images, index);
          });
  
          imgContainer.appendChild(img);
  
          // Create delete button
          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Delete';
          deleteButton.className = 'delete-button';
          deleteButton.addEventListener('click', () => {
            deleteImage(imageKey);
          });
  
          imgContainer.appendChild(deleteButton);
  
          // Prepend the new image on top
          imageGallery.prepend(imgContainer);
        });
      })
      .catch((error) => {
        console.error('Error getting images: ', error);
      });
  }
  
  // Initial display of images
  displayImages();
  
  // Function to handle image preview in modal
  function openImagePreview(images, currentIndex) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const closeModal = document.querySelector('.close');
  
    // Show the modal
    modal.style.display = 'block';
  
    // Set initial image
    modalImage.src = images[currentIndex].url;
  
    // Handle left/right swipe for next/previous image
    function changeImage(direction) {
      currentIndex = (currentIndex + direction + images.length) % images.length;
      modalImage.src = images[currentIndex].url;
    }
  
    // Close modal on close button click
    closeModal.onclick = function () {
      modal.style.display = 'none';
    };
  
    // Handle left/right navigation with arrow keys
    document.onkeydown = function (e) {
      if (e.key === 'ArrowLeft') {
        changeImage(-1);
      } else if (e.key === 'ArrowRight') {
        changeImage(1);
      }
    };
  
    // Handle swipe gestures for touch devices
    let touchStartX = 0;
    modalImage.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    modalImage.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) {
        changeImage(1); // Swipe left
      } else if (touchStartX - touchEndX < -50) {
        changeImage(-1); // Swipe right
      }
    });
  }
  