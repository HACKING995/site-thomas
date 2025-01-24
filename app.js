let users = [];
let currentUser = null;

const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const passwordResetModal = document.getElementById('password-reset-modal');
const profileInfo = document.getElementById('profile-info');
const messageForm = document.getElementById('message-form');
const loginPrompt = document.getElementById('login-prompt');
const closeBtns = document.querySelectorAll('.close');

// Gestionnaires modaux
loginBtn.addEventListener('click', () => loginModal.style.display = 'block');
registerBtn.addEventListener('click', () => registerModal.style.display = 'block');
closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
        passwordResetModal.style.display = 'none';
    });
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.style.display = 'none';
    if (e.target === registerModal) registerModal.style.display = 'none';
    if (e.target === passwordResetModal) passwordResetModal.style.display = 'none';
});

// Inscription
document.getElementById('register-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);

    const username = formData.get('username');
    const email = formData.get('email');

    // Vérification d'unicité
    if (users.some(user => user.email === email)) {
        alert('Cet email est déjà enregistré.');
        return;
    }
    if (users.some(user => user.username === username)) {
        alert('Ce nom d\'utilisateur est déjà pris.');
        return;
    }

    const avatarFile = formData.get('avatar');
    let avatarUrl = 'https://via.placeholder.com/40';
    
    if (avatarFile && avatarFile.size > 0) {
        avatarUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(avatarFile);
        });
    }

    const newUser = {
        username,
        email,
        password: formData.get('password'),
        avatar: avatarUrl
    };

    users.push(newUser);
    loginUser(newUser);
    registerModal.style.display = 'none';
    this.reset();
});

// Connexion
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const user = users.find(u => u.email === formData.get('email') && u.password === formData.get('password'));
    
    if (user) {
        loginUser(user);
        loginModal.style.display = 'none';
        this.reset();
    } else {
        alert('Email ou mot de passe incorrect');
    }
});

// Réinitialisation du mot de passe
document.getElementById('password-reset-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = new FormData(this).get('email');
    const user = users.find(u => u.email === email);
    
    if (user) {
        alert('Un lien de réinitialisation a été envoyé à ' + email);
    } else {
        alert('Aucun compte trouvé pour cet email.');
    }

    passwordResetModal.style.display = 'none';
    this.reset();
});

function loginUser(user) {
    currentUser = user;
    document.getElementById('profile-avatar').src = user.avatar;
    document.getElementById('profile-name').textContent = user.username;
    loginBtn.classList.add('hidden');
    registerBtn.classList.add('hidden');
    profileInfo.classList.remove('hidden');
    messageForm.classList.remove('hidden');
    loginPrompt.classList.add('hidden');
}

document.getElementById('logout-btn').addEventListener('click', function() {
    currentUser = null;
    loginBtn.classList.remove('hidden');
    registerBtn.classList.remove('hidden');
    profileInfo.classList.add('hidden');
    messageForm.classList.add('hidden');
    loginPrompt.classList.remove('hidden');
});

// Gestion des messages
const form = document.getElementById('message-form');
const messagesDiv = document.getElementById('messages');

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!currentUser) return;

    const messageInput = document.getElementById('message-input');
    const imageInput = document.getElementById('image-input');
    
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    const messageHeader = document.createElement('div');
    messageHeader.classList.add('message-header');
    
    const avatarImg = document.createElement('img');
    avatarImg.src = currentUser.avatar;
    avatarImg.classList.add('message-avatar');
    
    const authorSpan = document.createElement('span');
    authorSpan.classList.add('message-author');
    authorSpan.textContent = currentUser.username;
    
    const timestampSpan = document.createElement('span');
    timestampSpan.classList.add('message-timestamp');
    timestampSpan.textContent = new Date().toLocaleString();

    messageHeader.appendChild(avatarImg);
    messageHeader.appendChild(authorSpan);
    messageHeader.appendChild(timestampSpan);
    messageElement.appendChild(messageHeader);

    const textElement = document.createElement('p');
    textElement.textContent = messageInput.value;
    messageElement.appendChild(textElement);

    if (imageInput.files.length > 0) {
        const imgElement = document.createElement('img');
        const imageUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(imageInput.files[0]);
        });
        imgElement.src = imageUrl;
        imgElement.alt = "Image jointe";
        imgElement.classList.add('message-image');
        messageElement.appendChild(imgElement);
    }

    // Ajout des boutons supprimer et répondre
    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('message-actions');

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Supprimer';
    deleteButton.classList.add('delete-btn');
    deleteButton.addEventListener('click', () => {
        messagesDiv.removeChild(messageElement);
    });

    const replyButton = document.createElement('button');
    replyButton.textContent = 'Répondre';
    replyButton.classList.add('reply-btn');
    replyButton.addEventListener('click', () => {
        messageInput.value = `@${currentUser.username} `;
        messageInput.focus();
    });

    actionsDiv.appendChild(deleteButton);
    actionsDiv.appendChild(replyButton);
    messageElement.appendChild(actionsDiv);

    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    form.reset();
});
