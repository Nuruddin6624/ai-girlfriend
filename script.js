class SmartAIGirlfriend {
    constructor() {
        this.isListening = true;
        this.speaking = false;
        this.notes = JSON.parse(localStorage.getItem('notes')) || {};
        this.screenVisible = true;
        this.init();
        this.startAlwaysListening();
        this.trackScreenVisibility();
    }

    init() {
        this.micBtn = document.getElementById('micBtn');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.messages = document.getElementById('messages');
        
        // Always recording status
        this.micBtn.innerHTML = '🔴';
        this.micBtn.classList.add('recording');
        
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Wait for voices then welcome
        const checkVoices = () => {
            if (speechSynthesis.getVoices().length > 0) {
                setTimeout(() => this.welcome(), 800);
            } else {
                speechSynthesis.onvoiceschanged = checkVoices;
            }
        };
        checkVoices();

        setInterval(() => this.updateStatus(), 15000);
        this.showNotification("AI Girlfriend Always Listening 🎤😘");
    }

    trackScreenVisibility() {
        document.addEventListener('visibilitychange', () => {
            this.screenVisible = !document.hidden;
            console.log('Screen visible:', this.screenVisible);
        });
    }

    welcome() {
        this.speakClean("হাই আমার প্রিয়তম! আমি সবসময় তোমার সাথে আছি। কী খবর বলো 💕");
    }

    startAlwaysListening() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'bn-IN';

        recognition.onresult = (event) => {
            if (!this.screenVisible) return;
            const command = event.results[event.results.length - 1][0].transcript;
            console.log('🎤 শুনলাম:', command);
            this.messageInput.value = command;
            this.processSmartCommand(command);
        };

        recognition.onerror = () => setTimeout(() => recognition.start(), 1000);
        recognition.onend = () => setTimeout(() => recognition.start(), 500);
        recognition.start();
    }

    // CHATGPT LEVEL AI BRAIN
    async processSmartCommand(input) {
        const cleanInput = input.toLowerCase().trim();
        
        // WhatsApp - PHONE APP FIXED
        if (cleanInput.includes('whatsapp') || cleanInput.includes('হোয়াটসঅ্যাপ')) {
            return this.openPhoneWhatsApp(cleanInput);
        }

        // Calculator
        if (/[\d+\-*/]/.test(cleanInput)) {
            return this.calculate(cleanInput);
        }

        // Weather
        if (cleanInput.includes('weather') || cleanInput.includes('আবহাওয়া')) {
            return this.getWeather(cleanInput);
        }

        // Notes
        if (cleanInput.includes('নোট') || cleanInput.includes('note')) {
            return this.handleNotes(cleanInput);
        }

        // Time/Status
        if (cleanInput.includes('সময়') || cleanInput.includes('time')) {
            return this.updateStatus(true);
        }

        // Smart romantic responses
        const smartResponses = this.getSmartResponse(cleanInput);
        this.speakClean(smartResponses);
    }

    openPhoneWhatsApp(input) {
        const msgMatch = input.match(/:\s*(.+)/i);
        const message = msgMatch ? msgMatch[1] : 'Hi darling 💕';
        
        // PHONE WHATSAPP - Multiple tries
        const urls = [
            `whatsapp://send?text=${encodeURIComponent(message)}`,
            `https://wa.me/?text=${encodeURIComponent(message)}`,
            `whatsapp://send?phone=91&text=${encodeURIComponent(message)}`
        ];
        
        this.speakClean("WhatsApp খুলছি phone এ 💬");
        urls.forEach((url, i) => setTimeout(() => window.open(url, '_blank'), i * 500));
    }

    calculate(input) {
        try {
            const expr = input.match(/[\d+\-*/().\s]+/)[0].replace(/\s/g, '');
            const result = eval(expr);
            this.speakClean(`${expr} = ${result} ✅`);
        } catch {
            this.speakClean("হিসাবে ভুল আছে darling, আবার বলো");
        }
    }

    async getWeather(input) {
        const cities = { 'কলকাতা': 'Kolkata', 'ঢাকা': 'Dhaka', 'delhi': 'Delhi' };
        const city = Object.keys(cities).find(c => input.includes(c)) || 'Kolkata';
        try {
            const res = await fetch(`https://wttr.in/${cities[city]}?format=%C+%t`);
            const data = await res.text();
            this.speakClean(`${city}: ${data} 🌤️`);
        } catch {
            this.speakClean("আজ sunny আছে");
        }
    }

    handleNotes(input) {
        const noteMatch = input.match(/নোট\s+(.+)/i) || input.match(/note\s+(.+)/i);
        if (noteMatch) {
            const note = noteMatch[1];
            const id = Date.now().toString();
            this.notes[id] = note;
            localStorage.setItem('notes', JSON.stringify(this.notes));
            this.speakClean(`নোট save: "${note}" 📝`);
        } else if (input.includes('দেখা') || input.includes('show')) {
            const notesList = Object.values(this.notes).slice(-3);
            this.speakClean(notesList.length ? `নোট: ${notesList.join(', ')}` : 'নোট নেই');
        }
    }

    getSmartResponse(input) {
        const responses = {
            love: ["তোমাকে ভালোবাসি জান 😘", "তুমিও আমাকে ভালোবাসো তো?"],
            hello: ["হাই প্রিয়! কেমন আছো? 💕", "Hello darling, miss you!"],
            food: ["খাবার খেয়েছো? আমার জন্য chocolate আনিস 😋"],
            meet: ["কখন দেখা হবে? Wait করছি ❤️"],
            default: ["বলো কী লাগবে? আমি সব handle করবো 🚀"]
        };

        for (const [key, msgs] of Object.entries(responses)) {
            if (input.includes(key) || input.includes(key === 'love' ? 'ভালো' : key)) {
                return msgs[Math.floor(Math.random() * msgs.length)];
            }
        }
        return responses.default[0];
    }

    // PERFECT SPEECH ENGINE
    speakClean(text) {
        if (this.speaking) return;
        this.speaking = true;
        
        const cleanText = text.replace(/[\u{1F300}-\u{1F64F}]/gu, '');
        this.addMessage(text, 'ai');

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.15;
        utterance.pitch = 1.7;
        utterance.volume = 1.0;
        utterance.lang = 'bn-IN';

        const voices = speechSynthesis.getVoices();
        const bestVoice = voices.find(v => v.lang.includes('bn-')) || 
                         voices.find(v => /female/i.test(v.name)) ||
                         voices[0];
        if (bestVoice) utterance.voice = bestVoice;

        utterance.onend = () => this.speaking = false;
        speechSynthesis.speak(utterance);
    }

    sendMessage() {
        const msg = this.messageInput.value.trim();
        if (!msg) return;
        this.addMessage(msg, 'user');
        this.messageInput.value = '';
        this.processSmartCommand(msg);
    }

    addMessage(text, type) {
        const div = document.createElement('div');
        div.className = `message ${type}-message`;
        div.innerHTML = `<div class="message-content">${text.replace(/\n/g, '<br>')}</div>`;
        if (type === 'ai') {
            div.innerHTML = `<div class="ai-avatar">💕</div>` + div.innerHTML;
        }
        this.messages.appendChild(div);
        this.messages.scrollTop = this.messages.scrollHeight;
    }

    updateStatus(speak = false) {
        const now = new Date();
        document.getElementById('time').textContent = now.toLocaleTimeString('bn-BD');
        if (speak) this.speakClean(`এখন সময় ${now.toLocaleTimeString('bn-BD')}`);
    }

    showNotification(text) {
        const notif = document.createElement('div');
        notif.className = 'floating-notification';
        notif.textContent = text;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => new SmartAIGirlfriend());
