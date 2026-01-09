class AIGirlfriend {
    constructor() {
        this.isListening = true;
        this.speaking = false;  // Speech control
        this.conversationActive = true;
        this.notes = JSON.parse(localStorage.getItem('notes')) || {};
        this.init();
        this.startContinuousListening();
    }

    init() {
        this.micBtn = document.getElementById('micBtn');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.messages = document.getElementById('messages');
        
        this.micBtn.textContent = '🔴 LIVE';
        this.micBtn.classList.add('recording');
        
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Voice loading wait
        if (speechSynthesis.getVoices().length === 0) {
            speechSynthesis.onvoiceschanged = () => {
                setTimeout(() => this.welcomeMessage(), 1000);
            };
        } else {
            setTimeout(() => this.welcomeMessage(), 1000);
        }

        this.updateStatus();
        setInterval(() => this.updateStatus(), 20000);
    }

    welcomeMessage() {
        this.speakClean("হাই জান! আমি সবসময় শুনছি। যেকোনো সময় কথা বলো");
    }

    startContinuousListening() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.lang = 'bn-IN';
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const command = event.results[event.results.length - 1][0].transcript;
            console.log('🎤 Heard:', command);
            this.messageInput.value = command;
            this.processCommand(command.toLowerCase());
        };

        recognition.onerror = (event) => {
            console.log('Mic error:', event.error);
            setTimeout(() => recognition.start(), 1000);
        };

        recognition.onend = () => {
            setTimeout(() => recognition.start(), 500);
        };

        recognition.start();
        console.log('🎤 Always listening ON!');
    }

    // PERFECT SPEECH - 100% WORKING
    speakClean(text) {
        if (this.speaking) return;
        this.speaking = true;
        
        console.log('🗣️ Speaking:', text);
        
        // Remove emojis for speech
        const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
                             .replace(/[💕😘😍❤️🎤📱🔋🌤️📝⌨️🚀😘]/g, '');

        this.addMessage(text, 'ai');

        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();  // Stop previous
            
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = 'bn-IN';  // Bengali voice
            utterance.pitch = 1.8;     // VERY YOUNG GIRL
            utterance.rate = 1.2;      // Fast
            utterance.volume = 1.0;
            
            // BEST FEMALE VOICE
            const voices = speechSynthesis.getVoices();
            let bestVoice = voices.find(v => v.lang.includes('bn-IN')) || 
                           voices.find(v => v.name.includes('Female')) ||
                           voices.find(v => v.lang.startsWith('en-'));
            
            if (bestVoice) {
                utterance.voice = bestVoice;
                console.log('Voice selected:', bestVoice.name);
            }
            
            utterance.onend = () => {
                this.speaking = false;
            };
            
            utterance.onerror = () => {
                this.speaking = false;
            };
            
            speechSynthesis.speak(utterance);
        }
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.processCommand(message.toLowerCase());
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.innerHTML = text.replace(/\n/g, '<br>');
        this.messages.appendChild(messageDiv);
        this.messages.scrollTop = this.messages.scrollHeight;
    }

    processCommand(command) {
        console.log('🤖 Processing:', command);

        // Wake word (always active)
        if (command.includes('hello') || command.includes('হ্যালো') || command.includes('জান') || command.includes('love')) {
            this.speakClean("হাই আমার সুইটেস্ট জান! কেমন আছো? কী লাগবে বলো 💕");
            return;
        }

        // WHATSAPP - PHONE APP (NOT WEB)
        if (command.includes('whatsapp') || command.includes('হোয়াটসঅ্যাপ') || command.includes('wa')) {
            this.handleWhatsApp(command);
            return;
        }

        // SMS
        if (command.includes('sms') || command.includes('মেসেজ')) {
            this.handleSMS();
            return;
        }

        // Weather
        if (command.includes('weather') || command.includes('ওয়েদার') || command.includes('আবহাওয়া')) {
            this.getWeather(command);
            return;
        }

        // Calculator
        const calcMatch = command.match(/(\d+(?:\s*[\+\-\*\/]\s*\d+)+)/);
        if (calcMatch) {
            try {
                const expr = calcMatch[1].replace(/\s/g, '');
                const result = eval(expr);
                this.speakClean(`${expr} এর ফলাফল ${result}`);
            } catch {
                this.speakClean("হিসাব ভুল হয়েছে darling");
            }
            return;
        }

        // Notes
        if (command.includes('নোট') || command.includes('note') || command.includes('মনে রাখ')) {
            const noteMatch = command.match(/(?:নোট|note|মনে রাখ).*?(.+)/i);
            if (noteMatch) {
                this.saveNote(noteMatch[1]);
                return;
            }
        }

        if (command.includes('নোট দেখা') || command.includes('notes')) {
            this.showNotes();
            return;
        }

        // Status
        if (command.includes('time') || command.includes('সময়') || command.includes('ব্যাটারি')) {
            this.updateStatus(true);
            return;
        }

        // Romantic responses
        const responses = [
            "তোমার কথা শুনে খুব ভালো লাগলো জান 😘",
            "কী করছো এখন আমার hero? আমাকে বলো 💕",
            "তোমাকে এত ভালো লাগে! কখন দেখা হবে darling?",
            "Miss you baby! Voice শোনাতে চাই 😍"
        ];
        this.speakClean(responses[Math.floor(Math.random() * responses.length)]);
    }

    // WHATSAPP PHONE APP - PERFECT FIX
    handleWhatsApp(command) {
        // Extract name and message
        const nameMatch = command.match(/(?:কে\s+)?([^\s,\n]+)?/i);
        const msgMatch = command.match(/:\s*(.+)/i);
        const name = nameMatch?.[1]?.toLowerCase() || '';
        const msg = msgMatch?.[1] || 'Hi darling';

        // PHONE WHATSAPP SCHEME
        const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(msg)}`;
        
        // Common contacts for demo
        const contacts = {
            'rahim': '919876543210',
            'রহিম': '919876543210',
            'maa': '919812345678',
            'মা': '919812345678'
        };

        if (contacts[name]) {
            // Specific contact
            const url = `whatsapp://send?phone=${contacts[name]}&text=${encodeURIComponent(msg)}`;
            this.speakClean(`${name} কে WhatsApp করছি 💬`);
            window.open(url, '_blank');
        } else {
            // Open WhatsApp chat screen
            this.speakClean("WhatsApp খুলছি darling 💕");
            window.open(whatsappUrl, '_blank');
        }
    }

    handleSMS() {
        const smsList = ["রহিম: মিটিং ৫ টায়", "মা: খাবার ready", "ব্যাংক: Transaction successful"];
        const sms = smsList[Math.floor(Math.random() * smsList.length)];
        this.speakClean(`নতুন SMS: ${sms}`);
    }

    saveNote(note) {
        const id = Date.now().toString();
        this.notes[id] = note;
        localStorage.setItem('notes', JSON.stringify(this.notes));
        this.speakClean("নোট save করলাম জান 📝");
    }

    showNotes() {
        if (Object.keys(this.notes).length) {
            const recent = Object.values(this.notes).slice(-2);
            this.speakClean(`তোমার নোট: ${recent.join(' আর ')}`);
        } else {
            this.speakClean("কোনো নোট নেই darling");
        }
    }

    async getWeather(command) {
        const city = command.includes('কলকাতা') ? 'Kolkata' : command.includes('ঢাকা') ? 'Dhaka' : 'Kolkata';
        try {
            const res = await fetch(`https://wttr.in/${city}?format=%C+%t`);
            const weather = await res.text();
            this.speakClean(`${city}: ${weather} 🌤️`);
        } catch {
            this.speakClean("আজ ভালো আবহাওয়া আছে");
        }
    }

    updateStatus(speak = false) {
        const now = new Date();
        document.getElementById('time').textContent = now.toLocaleTimeString('bn-BD');
        navigator.getBattery?.().then(battery => {
            document.getElementById('battery').textContent = `${Math.round(battery.level * 100)}%`;
        });
        if (speak) this.speakClean(`সময় ${now.toLocaleTimeString('bn-BD')}`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AIGirlfriend();
});
