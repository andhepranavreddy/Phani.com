// Get references to DOM elements
const photoInput = document.getElementById('photoInput');
const videoInput = document.getElementById('videoInput');
const mediaContainer = document.getElementById('mediaContainer');
const noMediaMessage = document.getElementById('noMediaMessage');
const messageBox = document.getElementById('messageBox');
const clearAllButton = document.getElementById('clearAllButton');

const homeLink = document.getElementById('homeLink');
const homeContent = document.getElementById('homeContent');
const loggedInContent = document.getElementById('loggedInContent');

// Auth elements
const authSection = document.getElementById('authSection');
const authTitle = document.getElementById('authTitle');
const authForm = document.getElementById('authForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const authSubmitButton = document.getElementById('authSubmitButton');
const toggleAuthModeButton = document.getElementById('toggleAuthModeButton');
const loggedInUserSpan = document.getElementById('loggedInUser');
const logoutButton = document.getElementById('logoutButton');
const resetPasswordLink = document.getElementById('resetPasswordLink');

// Password Reset Modal elements
const resetPasswordModal = document.getElementById('resetPasswordModal');
const closeResetModalButton = document.getElementById('closeResetModal');
const resetPasswordForm = document.getElementById('resetPasswordForm');
const resetUsernameInput = document.getElementById('resetUsername');
const currentPasswordInput = document.getElementById('currentPassword');
const newPasswordInput = document.getElementById('newPassword');
const confirmNewPasswordInput = document.getElementById('confirmNewPassword');

// Keys for local storage
const LOCAL_STORAGE_ALL_USERS_KEY = 'mediaVaultAllUsers';
const LOCAL_STORAGE_CURRENT_USER_ID_KEY = 'mediaVaultCurrentUserId';
const LOCAL_STORAGE_USER_MEDIA_PREFIX = 'localMediaVault_user_'; // Suffix with userId

let currentUser = null; // Stores the current logged-in user object { id, username }
let allUsers = []; // Stores all registered users

let isRegisterMode = false; // To toggle between login and register forms

// Max file size for local storage (e.g., 5MB per file for demonstration)
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Displays a message to the user.
 * @param {string} message - The message to display.
 * @param {boolean} isError - True if it's an error message, false for success.
 */
function showMessage(message, isError = false) {
    messageBox.textContent = message;
    messageBox.className = 'message-box show'; // Reset classes
    if (isError) {
        messageBox.classList.add('error');
    } else {
        messageBox.classList.remove('error');
    }
    setTimeout(() => {
        messageBox.classList.remove('show');
    }, 3000); // Hide after 3 seconds
}

/**
 * Generates a unique ID for users.
 * @returns {string} A unique ID.
 */
function generateUniqueId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Loads all users from local storage.
 */
function loadAllUsers() {
    allUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ALL_USERS_KEY) || '[]');
}

/**
 * Saves all users to local storage.
 */
function saveAllUsers() {
    localStorage.setItem(LOCAL_STORAGE_ALL_USERS_KEY, JSON.stringify(allUsers));
}

/**
 * Authenticates a user.
 * @param {string} username - The username.
 * @param {string} password - The password.
 * @returns {object|null} The user object if successful, null otherwise.
 */
function authenticateUser(username, password) {
    const user = allUsers.find(u => u.username === username && u.password === password);
    return user || null;
}

/**
 * Registers a new user.
 * @param {string} username - The username.
 * @param {string} password - The password.
 * @returns {object|null} The new user object if successful, null if username exists.
 */
function registerUser(username, password) {
    if (allUsers.some(u => u.username === username)) {
        showMessage('Username already exists!', true);
        return null;
    }
    const newUser = { id: generateUniqueId(), username: username, password: password }; // Storing plain password for simplicity, NOT secure for real apps
    allUsers.push(newUser);
    saveAllUsers();
    return newUser;
}

/**
 * Handles user login.
 * @param {Event} event - The form submit event.
 */
function handleLogin(event) {
    event.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        showMessage('Please enter both username and password.', true);
        return;
    }

    const user = authenticateUser(username, password);
    if (user) {
        currentUser = user;
        localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_ID_KEY, currentUser.id);
        showMessage(`Welcome, ${currentUser.username}!`);
        showLoggedInContent();
        loadMedia(); // Load media for the logged-in user
    } else {
        showMessage('Invalid username or password.', true);
    }
}

/**
 * Handles user registration.
 * @param {Event} event - The form submit event.
 */
function handleRegister(event) {
    event.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        showMessage('Please enter both username and password.', true);
        return;
    }

    const newUser = registerUser(username, password);
    if (newUser) {
        currentUser = newUser;
        localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_ID_KEY, currentUser.id);
        showMessage(`Account "${currentUser.username}" created and logged in!`);
        showLoggedInContent();
        loadMedia(); // Load media for the new user
    }
}

/**
 * Logs out the current user.
 */
function logoutUser() {
    currentUser = null;
    localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER_ID_KEY);
    showMessage('Logged out successfully.');
    showAuthSection();
    // Clear UI elements related to logged-in state
    loggedInUserSpan.textContent = '';
    logoutButton.classList.add('hidden');
}

/**
 * Shows the authentication section (login/register form).
 */
function showAuthSection() {
    loggedInContent.classList.add('hidden');
    homeContent.classList.add('hidden'); // Ensure home content is hidden
    authSection.classList.remove('hidden');
    // Reset form fields
    usernameInput.value = '';
    passwordInput.value = '';
    toggleAuthMode(false); // Default to login mode
}

/**
 * Shows the main content after successful login.
 */
function showLoggedInContent() {
    authSection.classList.add('hidden');
    loggedInContent.classList.remove('hidden');
    loggedInUserSpan.textContent = `Hello, ${currentUser.username}`;
    logoutButton.classList.remove('hidden');
    homeContent.classList.remove('hidden'); // Show home content
    loadMedia(); // Ensure media is loaded
}

/**
 * Toggles between login and register modes.
 * @param {boolean} forceRegister - If true, forces register mode. If false, forces login mode. If undefined, toggles.
 */
function toggleAuthMode(forceRegister = undefined) {
    if (forceRegister === true) {
        isRegisterMode = true;
    } else if (forceRegister === false) {
        isRegisterMode = false;
    } else {
        isRegisterMode = !isRegisterMode;
    }

    if (isRegisterMode) {
        authTitle.textContent = 'Register';
        authSubmitButton.textContent = 'Register';
        toggleAuthModeButton.textContent = 'Login instead';
        authForm.onsubmit = handleRegister;
    } else {
        authTitle.textContent = 'Login';
        authSubmitButton.textContent = 'Login';
        toggleAuthModeButton.textContent = 'Register instead';
        authForm.onsubmit = handleLogin;
    }
}

/**
 * Gets the dynamic local storage key for the current user's media.
 * @returns {string} The local storage key.
 */
function getUserMediaKey() {
    if (!currentUser) return null;
    return LOCAL_STORAGE_USER_MEDIA_PREFIX + currentUser.id;
}

/**
 * Loads media from local storage for the current user and displays them.
 */
function loadMedia() {
    // Clear current display
    mediaContainer.innerHTML = '';
    const mediaKey = getUserMediaKey();
    if (!mediaKey) {
        noMediaMessage.style.display = 'block';
        noMediaMessage.textContent = 'Please log in to view media.';
        return;
    }

    const storedMedia = JSON.parse(localStorage.getItem(mediaKey) || '[]');

    if (storedMedia.length === 0) {
        noMediaMessage.style.display = 'block'; // Show "No media stored yet" message
        noMediaMessage.textContent = 'No media stored yet. Upload some files!';
        return;
    } else {
        noMediaMessage.style.display = 'none'; // Hide the message
    }

    // Iterate through stored media and create elements
    storedMedia.forEach((media, index) => {
        const mediaItem = document.createElement('div');
        mediaItem.className = 'media-item';

        // Create media element (img or video)
        let mediaElement;
        if (media.type.startsWith('image/')) {
            mediaElement = document.createElement('img');
            mediaElement.src = media.data;
            mediaElement.alt = `Image ${index + 1}`;
        } else if (media.type.startsWith('video/')) {
            mediaElement = document.createElement('video');
            mediaElement.src = media.data;
            mediaElement.controls = true; // Add controls for video playback
            mediaElement.preload = 'metadata'; // Preload metadata for quicker display
        } else {
            // Fallback for unsupported types, though input accepts only image/video
            console.warn('Unsupported media type found in storage:', media.type);
            return;
        }

        // Add delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'X';
        deleteButton.onclick = () => deleteMedia(index); // Attach delete handler

        mediaItem.appendChild(mediaElement);
        mediaItem.appendChild(deleteButton);
        mediaContainer.appendChild(mediaItem);
    });
}

/**
 * Deletes a media item from local storage for the current user and reloads the display.
 * @param {number} indexToDelete - The index of the media item to delete.
 */
function deleteMedia(indexToDelete) {
    const mediaKey = getUserMediaKey();
    if (!mediaKey) return;

    let storedMedia = JSON.parse(localStorage.getItem(mediaKey) || '[]');
    storedMedia.splice(indexToDelete, 1); // Remove item at specified index
    localStorage.setItem(mediaKey, JSON.stringify(storedMedia));
    showMessage('Media deleted successfully!');
    loadMedia(); // Reload display
}

/**
 * Clears all media from local storage for the current user.
 */
function clearAllMedia() {
    const mediaKey = getUserMediaKey();
    if (!mediaKey) {
        showMessage('No user logged in to clear media.', true);
        return;
    }

    if (confirm('Are you sure you want to delete all stored media for your account? This action cannot be undone.')) {
        localStorage.removeItem(mediaKey);
        showMessage('All media cleared for your account!', false);
        loadMedia(); // Reload display
    }
}

/**
 * Handles file selection and conversion to Base64.
 * @param {Event} event - The change event from the file input.
 */
async function handleFileSelect(event) {
    if (!currentUser) {
        showMessage('Please log in to upload media.', true);
        event.target.value = ''; // Clear input
        return;
    }

    const files = event.target.files;
    if (files.length === 0) {
        return;
    }

    const mediaKey = getUserMediaKey();
    let storedMedia = JSON.parse(localStorage.getItem(mediaKey) || '[]');
    let filesAddedCount = 0;

    for (const file of files) {
        // Check file size
        if (file.size > MAX_FILE_SIZE_BYTES) {
            showMessage(`File "${file.name}" is too large (max 5MB).`, true);
            continue;
        }

        // The `accept` attribute on the input already filters, but this adds a double-check.
        // For 'photoInput', only image types are expected. For 'videoInput', only video types.
        if (event.target.id === 'photoInput' && !file.type.startsWith('image/')) {
            showMessage(`File "${file.name}" is not an image.`, true);
            continue;
        }
        if (event.target.id === 'videoInput' && !file.type.startsWith('video/')) {
            showMessage(`File "${file.name}" is not a video.`, true);
            continue;
        }

        try {
            const base64Data = await readFileAsBase64(file);
            storedMedia.push({
                name: file.name,
                type: file.type,
                data: base64Data
            });
            filesAddedCount++;
        } catch (error) {
            console.error('Error reading file:', error);
            showMessage(`Could not read file "${file.name}".`, true);
        }
    }

    if (filesAddedCount > 0) {
        localStorage.setItem(mediaKey, JSON.stringify(storedMedia));
        showMessage(`${filesAddedCount} file(s) uploaded successfully!`);
        loadMedia(); // Reload display with new media
    } else if (files.length > 0 && filesAddedCount === 0) {
            showMessage('No valid files were uploaded.', true);
    }

    // Clear the input value so the same file can be selected again
    event.target.value = '';
}

/**
 * Reads a File object as a Base64 encoded string.
 * @param {File} file - The File object to read.
 * @returns {Promise<string>} A promise that resolves with the Base64 string.
 */
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Custom confirm dialog replacement (since alert/confirm are disallowed)
function confirm(message) {
    const confirmation = prompt(message + "\nType 'yes' to confirm.");
    return confirmation && confirmation.toLowerCase() === 'yes';
}

/**
 * Handles password reset form submission.
 * @param {Event} event - The form submit event.
 */
function handlePasswordReset(event) {
    event.preventDefault();
    const username = resetUsernameInput.value.trim();
    const currentPassword = currentPasswordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmNewPassword = confirmNewPasswordInput.value.trim();

    if (!username || !currentPassword || !newPassword || !confirmNewPassword) {
        showMessage('All fields are required.', true);
        return;
    }

    if (newPassword !== confirmNewPassword) {
        showMessage('New passwords do not match.', true);
        return;
    }

    if (newPassword.length < 6) { // Basic password strength check
        showMessage('New password must be at least 6 characters long.', true);
        return;
    }

    const userIndex = allUsers.findIndex(u => u.username === username);

    if (userIndex === -1) {
        showMessage('Username not found.', true);
        return;
    }

    if (allUsers[userIndex].password !== currentPassword) {
        showMessage('Current password is incorrect.', true);
        return;
    }

    // Update the password
    allUsers[userIndex].password = newPassword;
    saveAllUsers();
    showMessage('Password reset successfully! Please log in with your new password.');
    resetPasswordModal.classList.add('hidden'); // Hide the modal
    showAuthSection(); // Go back to login screen
}

// Initial setup and Event Listeners
window.onload = () => {
    loadAllUsers();
    const storedCurrentUserId = localStorage.getItem(LOCAL_STORAGE_CURRENT_USER_ID_KEY);

    if (storedCurrentUserId) {
        currentUser = allUsers.find(u => u.id === storedCurrentUserId);
        if (currentUser) {
            showLoggedInContent();
        } else {
            // Stored user ID is invalid, clear it and show auth section
            localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER_ID_KEY);
            showAuthSection();
        }
    } else {
        showAuthSection(); // No user logged in, show auth section
    }
};

// Auth event listeners
toggleAuthModeButton.addEventListener('click', () => toggleAuthMode());
logoutButton.addEventListener('click', logoutUser);
resetPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    resetPasswordModal.classList.remove('hidden'); // Show the modal
    resetPasswordForm.reset(); // Clear form fields
});

// Password Reset Modal event listeners
closeResetModalButton.addEventListener('click', () => {
    resetPasswordModal.classList.add('hidden'); // Hide the modal
});
resetPasswordForm.addEventListener('submit', handlePasswordReset);

// Media upload and clear event listeners
photoInput.addEventListener('change', handleFileSelect);
videoInput.addEventListener('change', handleFileSelect);
clearAllButton.addEventListener('click', clearAllMedia);

// Home link (now the only navigation link)
homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    // Since there's only one main content area, just ensure it's visible and load media
    if (currentUser) {
        showLoggedInContent();
    } else {
        showAuthSection();
    }
});