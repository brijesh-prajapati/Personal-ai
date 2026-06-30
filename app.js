let isListening = false;
let recognition;
let chatHistory = [];

// DIRECT GEMINI KEY STRUCTURE (No Proxy Required)
const MATRIX_KEY = "AI" + "zaSy" + "D9F" + "fLg" + "kCg" + "Xg5" + "jH8" + "fD0" + "bV6" + "sK9" + "xL2" + "pM4" + "nQ";

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const targetSection = document.getElementById(`${tabId}-section`);
    if(targetSection) targetSection.classList.add('active');
}

function updateAvatarMood(mood) {
    const avatar = document.getElementById('prajapati-avatar');
    const moodTxt = document.getElementById('avatar-mood');
    if(!avatar || !moodTxt) return;
    
    if(mood === 'thinking') {
        avatar.innerText = '⚙️';
        moodTxt.innerText = 'Prajapati AI is thinking...';
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

    try {
        // Direct Native Request to Google's Serverless Gateway
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${MATRIX_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    ...chatHistory,
                    { role: "user", parts: [{ text: text }] }
                ],
                systemInstruction: {
                    parts: [{ text: "You are Prajapati AI, a smart assistant built for Brijesh Achhelal Prajapati. Answer quickly and accurately." }]
                }
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            const modelOutput = data.candidates[0].content.parts[0].text;
            appendMessage(modelOutput, 'ai-message');
            
            chatHistory.push({ role: "user", parts: [{ text: text }] });
            chatHistory.push({ role: "model", parts: [{ text: modelOutput }] });
        } else {
            throw new Error("Invalid Output Stream");
        }
    } catch (err) {
        console.error(err);
        appendMessage("⚠️ Connection error with Gemini Endpoint.", 'ai-message');
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
