// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getStorage, ref, uploadBytesResumable, listAll, getMetadata, deleteObject, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDRqrzeQHsWOzP6RH6ne4Rh9rrKEHdNbKM",
    authDomain: "beautiful-photos-web-app.firebaseapp.com",
    projectId: "beautiful-photos-web-app",
    storageBucket: "beautiful-photos-web-app.appspot.com",
    messagingSenderId: "821802313922",
    appId: "1:821802313922:web:2e67be4008a0aa804a335b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const storageRef = ref(storage);



// -------popup message--------
// calert == custom calert using popup message
const calert = (message, type = 'info') => {
    const popup = document.getElementById('popup-message');
    const overlay = document.getElementById('popup-overlay');
    
    // Remove all possible classes first
    popup.classList.remove('success', 'error', 'info');
    
    // Add the appropriate type class
    popup.classList.add(type);
    
    // Set message and show popup with overlay
    popup.textContent = message;
    popup.classList.remove('hidden');
    popup.classList.add('visible');
    overlay.classList.remove('hidden');
    overlay.classList.add('visible');
    
    // Hide popup and overlay after 2 seconds
    setTimeout(() => {
        popup.classList.remove('visible');
        popup.classList.add('hidden');
        overlay.classList.remove('visible');
        overlay.classList.add('hidden');
    }, 2000);
};
// Replace the alert with this function
// calert(`Error uploading file: ${error}`, 'error');
// -------popup message end--------





// Function to upload files
// Adjusted Function to upload files to 'tempFile' folder
function uploadFiles() {
    const files = document.getElementById('file-upload').files;
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    if (!files.length) {
        calert('Please select files to upload.', 'info');
        return;
    }

    let totalSize = 0;
    for (let file of files) {
        if (file.size > 500 * 1024 * 1024) {
            calert('File size exceeds the limit of 500MB.', 'error');
            return;
        }
        totalSize += file.size;
    }

    let totalBytesTransferred = 0;

    for (let file of files) {
        const fileRef = ref(storage, `tempFile/${file.name}`); // Uploading to 'tempFile'
        const uploadTask = uploadBytesResumable(fileRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const currentFileProgress = snapshot.bytesTransferred / file.size;
                const totalProgress = ((totalBytesTransferred + snapshot.bytesTransferred) / totalSize) * 100;

                progressBar.value = totalProgress;
                progressText.innerHTML = `Upload is ${totalProgress.toFixed(2)}% done`;
            },
            (error) => {
                calert(`Error uploading file: ${error}`, 'error');
            },
            () => {
                totalBytesTransferred += file.size;

                if (totalBytesTransferred === totalSize) {
                    calert('All files uploaded successfully.', 'success');
                    progressBar.value = 0;
                    progressText.innerHTML = '';
                    displayUploadedFiles();

                    // Clear file input after successful upload
                    document.getElementById('file-upload').value = '';
                }
            }
        );
    }
}

// Adjusted Function to display uploaded files from 'tempFile' folder
function displayUploadedFiles() {
    const fileList = document.getElementById('file-list');
    const total_size = document.getElementById('total-size');
    fileList.innerHTML = ''; // Clear existing list
    let tot = 0; // Total size in MB

    const tempFileRef = ref(storage, 'tempFile/'); // List files from 'tempFile' folder

    listAll(tempFileRef)
        .then((res) => {
            const filePromises = res.items.map((itemRef) =>
                getMetadata(itemRef)
                    .then((metadata) => ({
                        name: metadata.name,
                        size: metadata.size,
                        updated: metadata.updated,
                        ref: itemRef,
                    }))
                    .then((file) =>
                        getDownloadURL(file.ref).then((downloadURL) => ({
                            ...file,
                            downloadURL,
                        }))
                    )
            );

            return Promise.all(filePromises).then((files) =>
                files.sort((a, b) => new Date(b.updated) - new Date(a.updated))
            );
        })
        .then((sortedFiles) => {
            sortedFiles.forEach((file, index) => {
                const fileSizeMB = file.size / (1024 * 1024);
                tot += fileSizeMB;

                const listItem = document.createElement('li');
                listItem.className = 'bg-gray-50 p-4 rounded-lg shadow flex justify-between items-center';
                listItem.innerHTML = `
                    <div class="flex-1">
                        <span class="text-gray-700">(${index + 1}) ${file.name}</span>
                        <span class="text-gray-500 text-sm ml-2">(${fileSizeMB.toFixed(3)} MB)</span>
                    </div>
                    <div class="flex space-x-2">
                        <button class="view-btn  bg-gray-800 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-200">Download</button>
                        <button class="delete-btn bg-gray-800 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-200">Delete</button>
                    </div>
                `;

                fileList.appendChild(listItem);

                listItem.querySelector('.delete-btn').addEventListener('click', () => deleteFile(file.name));
                listItem.querySelector('.view-btn').addEventListener('click', () => {
                    window.open(file.downloadURL, '_blank'); // Open in a new tab
                });
            });

            total_size.textContent = "Total storage used: " + tot.toFixed(4) + " MB";
        })
        .catch((error) => {
            console.error('Error listing files:', error);
        });
}

// Adjusted Function to delete files from 'tempFile' folder
function deleteFile(fileName) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';

    modal.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 class="text-xl font-bold mb-4">Enter password to delete the file:</h3>
            <input type="password" id="password-input" placeholder="Eg. 12345" 
                   class="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <div class="flex space-x-2">
                <button id="toggle-password" 
                        class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition duration-200">Show</button>
                <button id="confirm-delete" 
                        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200">Confirm</button>
                <button id="cancel-delete" 
                        class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-200">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const passwordInput = document.getElementById('password-input');
    const togglePasswordButton = document.getElementById('toggle-password');
    const confirmDeleteButton = document.getElementById('confirm-delete');
    const cancelDeleteButton = document.getElementById('cancel-delete');

    togglePasswordButton.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            togglePasswordButton.textContent = 'Hide';
        } else {
            passwordInput.type = 'password';
            togglePasswordButton.textContent = 'Show';
        }
    });

    confirmDeleteButton.addEventListener('click', () => {
        const userInput = passwordInput.value;

        if (encrypt(userInput, 5) !== "#!5") {
            calert('Incorrect Password. Delete Failed', 'error');
        } else {
            const fileRef = ref(storage, `tempFile/${fileName}`); // Reference in 'tempFile'
            deleteObject(fileRef)
                .then(() => {
                    calert('File deleted successfully.', 'success');
                    displayUploadedFiles();
                })
                .catch((error) => {
                    calert(`Error deleting file: ${error}`, 'error');
                });
        }

        document.body.removeChild(modal); // Close the modal
    });

    cancelDeleteButton.addEventListener('click', () => {
        document.body.removeChild(modal); // Close the modal
    });
}


function encrypt(s, f) {
    var strArr = s.split(''); // Convert the string to an array of characters
    var sum;

    function process() {
        sum = strArr.length;

        for (var i = 0; i < strArr.length; i++) {
            sum += strArr[i].charCodeAt(0);
            sum %= 128;
            var c = Math.max(37, sum);
            var newChar = strArr[i].charCodeAt(0) ^ c;
            if (newChar <= 33) {
                newChar += 32;
            } else {
                newChar--;
            }
            strArr[i] = String.fromCharCode(newChar);
        }
    }

    while (f-- > 0) {
        process();
    }

    return strArr.join(''); // Convert the array back to a string
}



// Make functions accessible globally
window.uploadFiles = uploadFiles;
window.deleteFile = deleteFile;

// Initial call to display uploaded files
displayUploadedFiles();


function welcomeMessage(){
    calert("Hello !! Welcome to my Website", 'info');
}

welcomeMessage();