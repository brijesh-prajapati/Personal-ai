let isListening = false;
let recognition;

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(`${tabId}-section`).classList.add('active');
    event.currentTarget.classList.add('active');
}

function updateAvatarMood(mood) {
    const avatar = document.getElementById('prajapati-avatar');
    const moodTxt = document.getElementById('avatar-mood');
    avatar.className = 'avatar';

    if(mood === 'thinking') {
        avatar.classList.add('thinking');
        avatar.innerText = '⚙️';
        moodTxt.innerText = 'Thinking...';
    } else if (mood === 'creative') {
        avatar.innerText = '🎨';
        moodTxt.innerText = 'Generating Asset';
    } else {
        avatar.innerText = '✨';
        moodTxt.innerText = 'Neutral';
    }
}

function insertPrompt(type) {
    if(type === 'image') {
        const style = document.getElementById('style-preset').value;
        const styleString = style !== 'none' ? ` in ${style} style` : '';
        document.getElementById('user-input').value = `Generate an image of [describe your asset here]${styleString}`;
    }
}

function handleKeyPress(e) {
    if (e.key === 'Enter') sendMessage();
}

async function sendMessage() {
    const inputEl = document.getElementById('user-input');
    const text = inputEl.value.trim();
    if (!text) return;

    appendMessage(text, 'user-message');
    inputEl.value = '';

    updateAvatarMood('thinking');
    const isImageReq = /generate an image|draw|create a picture/i.test(text);

    try {
        setTimeout(() => {
            if (isImageReq) {
                updateAvatarMood('creative');
                const sampleMockUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500";
                appendImageMessage(sampleMockUrl);
                addToGallery(sampleMockUrl);
            } else {
                appendMessage("I am Prajapati AI. I have fully optimized structural knowledge for Full-Stack, Docker, Android configurations, and cross-platform architecture layouts.", 'ai-message');
            }
            updateAvatarMood('neutral');
        }, 1500);
    } catch (err) {
        appendMessage("System communication runtime exception occurred.", 'ai-message');
        updateAvatarMood('neutral');
    }
}

function appendMessage(text, className) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `message ${className}`;
    div.innerText = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function appendImageMessage(url) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `message ai-message`;
    const img = document.createElement('img');
    img.src = url;
    img.style.width = "100%";
    img.style.borderRadius = "8px";
    div.appendChild(img);
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function addToGallery(url) {
    const grid = document.getElementById('gallery-grid');
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.innerHTML = `<img src="${url}"><br><a href="${url}" target="_blank" style="color:var(--accent-color);text-decoration:none;font-size:0.8rem;">📥 Download Asset</a>`;
    grid.appendChild(div);
}

function toggleVoiceInput() {
    const micBtn = document.getElementById('mic-btn');
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Web Speech API is not supported on this device/browser.");
        return;
    }

    const SpeechObj = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!isListening) {
        recognition = new SpeechObj();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => {
            isListening = true;
            micBtn.classList.add('listening');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('user-input').value = transcript;
        };

        recognition.onerror = () => { stopListening(); };
        recognition.onend = () => { stopListening(); };
        recognition.start();
    } else {
        stopListening();
    }
}

function stopListening() {
    isListening = false;
    document.getElementById('mic-btn').classList.remove('listening');
    if(recognition) recognition.stop();
}
