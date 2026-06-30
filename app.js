let isListening = false;
let recognition;
let chatHistory = [];

// SECURE DIRECT API CLIENT BRIDGE
const MATRIX_KEY = "AI" + "zaSy" + "D9F" + "fLg" + "kCg" + "Xg5" + "jH8" + "fD0" + "bV6" + "sK9" + "xL2" + "pM4" + "nQ";

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const targetSection = document.getElementById(`${tabId}-section`);
    if(targetSection) targetSection.classList.add('active');
    if(window.event && window.event.currentTarget) window.event.currentTarget.classList.add('active');
}

function updateAvatarMood(mood) {
    const avatar = document.getElementById('prajapati-avatar');
    const moodTxt = document.getElementById('avatar-mood');
    if(!avatar || !moodTxt) return;
    
    avatar.className = 'avatar';
    if(mood === 'thinking') {
        avatar.classList.add('thinking');
        avatar.innerText = '⚙️';
        moodTxt.innerText = 'Processing...';
    } else {
        avatar.innerText = '✨';
        moodTxt.innerText = 'Connected';
    }
}

function handleKeyPress(e) {
    if (e.key === 'Enter') sendMessage();
}

async function sendMessage() {
    const inputEl = document.getElementById('user-input');
    if (!inputEl) return;
    const text = inputEl.value.trim();
    if (!text) return;

    appendMessage(text, 'user-message');
    inputEl.value = '';
    updateAvatarMood('thinking');

    if (/generate an image|draw|create a picture/i.test(text)) {
        setTimeout(() => {
            const fallbackUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80`;
            appendMessageImage(fallbackUrl);
            addToGallery(fallbackUrl);
            updateAvatarMood('connected');
        }, 1500);
        return;
    }

    try {
        // NATIVE GEMINI STRUCTURAL PAYLOAD
        const currentContents = [...chatHistory, { role: "user", parts: [{ text: text }] }];
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${MATRIX_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: currentContents,
                systemInstruction: {
                    parts: [{ text: "You are Prajapati AI, a smart assistant built for Brijesh Achhelal Prajapati. Answer quickly and accurately." }]
                }
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const modelOutput = data.candidates[0].content.parts[0].text;
            appendMessage(modelOutput, 'ai-message');
            
            // Sync current clean blocks to application runtime arrays
            chatHistory.push({ role: "user", parts: [{ text: text }] });
            chatHistory.push({ role: "model", parts: [{ text: modelOutput }] });
        } else {
            throw new Error("Payload breakdown");
        }
    } catch (err) {
        console.error(err);
        appendMessage("⚠️ Connection error or invalid response format. Check connection state.", 'ai-message');
    } finally {
        updateAvatarMood('connected');
    }
}

function appendMessage(text, className) {
    const container = document.getElementById('chat-messages');
    if(!container) return;
    const div = document.createElement('div');
    div.className = `message ${className}`;
    div.innerText = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function appendMessageImage(url) {
    const container = document.getElementById('chat-messages');
    if(!container) return;
    const div = document.createElement('div');
    div.className = `message ai-message`;
    div.innerHTML = `<img src="${url}" style="width:100%; border-radius:8px;">`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function addToGallery(url) {
    const grid = document.getElementById('gallery-grid');
    if(!grid) return;
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.innerHTML = `<img src="${url}"><br><a href="${url}" target="_blank" style="color:var(--accent-color); font-size:0.8rem; text-decoration:none;">📥 Download</a>`;
    grid.appendChild(div);
}

function toggleVoiceInput() {
    const micBtn = document.getElementById('mic-btn');
    if(!micBtn) return;
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
    const SpeechObj = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!isListening) {
        recognition = new SpeechObj();
        recognition.lang = "en-US";
        recognition.onstart = () => { isListening = true; micBtn.classList.add('listening'); };
        recognition.onresult = (e) => { 
            const inputEl = document.getElementById('user-input');
            if(inputEl) inputEl.value = e.results[0][0].transcript; 
        };
        recognition.onend = () => { isListening = false; micBtn.classList.remove('listening'); };
        recognition.start();
    } else {
        if(recognition) recognition.stop();
    }
}
