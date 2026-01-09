class AIGirlfriend {
    constructor() {
        this.isListening = true;  // ALWAYS ON
        this.conversationActive = true;
        this.notes = JSON.parse(localStorage.getItem('notes')) || {};
        this.smsQueue = [];
        this.init();
        this.startContinuousListening();  // Auto start
    }

    init() {
        this.micBtn = document.getElementById('micBtn');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.messages = document.getElementById('messages');
        
        // Mic button now shows status only
        this.micBtn.textContent = '🔴 LIVE';
        this.micBtn.classList.add('recording');
        
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        this.updateStatus();
        setInterval(() => this.updateStatus(), 20000);
        
        // Welcome + always listening notice
        setTimeout(() => {
            this.speakClean("হাই জান! আমি সবসময় শুনছি। যেকোনো সময় কথা বলো");
        }, 1000);
    }

    startContinuousListening() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.log('No speech recognition');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'bn-IN';
        recognition.continuous = true;  // NEVER stops
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const command = event.results[event.results.length - 1][0].transcript;
            console.log('Heard:', command);
            this.messageInput.value = command;
            this.processCommand(command.toLowerCase());
        };

        recognition.onerror = (event) => {
            console.log('Error:', event.error);
            // Auto restart on error
            setTimeout(() => recognition.start(), 1000);
        };

        recognition.onend = () => {
            // Auto restart
            setTimeout(() => recognition.start(), 500);
        };

        recognition.start();
        console.log('Always listening started!');
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

    // CLEAN SPEAK - NO EMOJI, YOUNG FEMALE VOICE
    speakClean(text) {
        console.log('Speaking:', text);
        
        // Remove emojis for speech only
        const cleanText = text.replace(/[\u{1F600}-\u{1F64F}]/gu, '').replace(/💕|😘|😍|❤️|🎤|📱|🔋/g, '');
        
        this.addMessage(text, 'ai');  // Full text with emoji in chat

        // PERFECT YOUNG FEMALE VOICE
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = 'en-US';  // Best female voices
            utterance.pitch = 1.5;     // HIGH PITCH = YOUNG GIRL
            utterance.rate = 1.1;      // Fast + energetic
            utterance.volume = 1.0;
            
            // Select young female voice
            const voices = speechSynthesis.getVoices();
            const youngFemale = voices.find(v => 
                v.lang.includes('en-US') && 
                (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha'))
            ) || voices.find(v => v.lang.startsWith('en-'));
            
            if (youngFemale) utterance.voice = youngFemale;
            
            speechSynthesis.cancel();
            speechSynthesis.speak(utterance);
        }
    }

    processCommand(command) {
        console.log('Command:', command);

        // Wake up (always active now)
        if (command.includes('hello') || command.includes('হ্যালো') || command.includes('জান')) {
            this.speakClean("হাই আমার সুইটেস্ট জান! কেমন আছো? কী লাগবে বলো");
            return;
        }

        // WhatsApp - IMPROVED
        const whatsappMatch = command.match(/(whatsapp|হোয়াটসঅ্যাপ|wa)\s*(?:কে\s+)?([^,\n]+)?(?:\s*:?\s*(.+))?/i);
        if (whatsappMatch) {
            const name = whatsappMatch[2]?.trim() || '';
            const msg = whatsappMatch[3]?.trim() || 'Hi darling';
            this.handleWhatsApp(name, msg);
            return;
        }

        // SMS/Message
        if (command.includes('sms') || command.includes('মেসেজ') || command.includes('message')) {
            this.handleSMS();
            return;
        }

        // Weather - wttr.in FREE API
        if (command.includes('weather') || command.includes('ওয়েদার') || command.includes('আবহাওয়া')) {
            const city = command.includes('কলকাতা') ? 'Kolkata' : command.includes('ঢাকা') ? 'Dhaka' : 'Kolkata';
            this.getWeather(city);
            return;
        }

        // Calculator
        const calcMatch = command.match(/(\d+(?:\s*[\+\-\*\/]\s*\d+)+)/);
        if (calcMatch) {
            try {
                const expr = calcMatch[1].replace(/\s/g, '');
                const result = eval(expr);
                this.speakClean(`ফলাফল হলো ${result}`);
            } catch {
                this.speakClean("হিসাব ভুল হয়েছে। আবার বলো");
            }
            return;
        }

        // Notes
        if (command.includes('নোট') || command.includes('note') || command.includes('মনে রাখ')) {
            const noteMatch = command.match(/(?:নোট|note|মনে রাখ)\s+(.+)/i);
            if (noteMatch) {
                this.saveNote(noteMatch[1]);
                return;
            }
        }

        // Show notes
        if (command.includes('নোট দেখা') || command.includes('notes')) {
            this.showNotes();
            return;
        }

        // Status
        if (command.includes('time') || command.includes('সময়') || command.includes('ব্যাটারি')) {
            this.updateStatus(true);
            return;
        }

        // SMART ROMANTIC RESPONSES - ALWAYS WORKS
        const responses = [
            "তোমার কথা শুনে আমার দিন ভালো হয়ে গেল জান",
            "কী করছো এখন আমার hero? আমাকে বলো",
            "তোমাকে এত ভালো লাগে! কখন দেখা হবে?",
            "আমি তোমার জন্য সবসময় ready জান",
            "তোমার smile এর জন্য wait করছি baby",
            "কী খাবি আজ? আমার জন্য chocolate আনিস?",
            "তোমার সাথে কথা বলতে সবচেয়ে ভালো লাগে",
            "Miss you darling! Voice শোনাতে চাই"
        ];

        const response = responses[Math.floor(Math.random() * responses.length)];
        this.speakClean(response);
    }

    handleWhatsApp(name, msg) {
        const demoNumbers = {
            'rahim': '919876543210',
            'রহিম': '919876543210',
            'maa': '919812345678',
            'মা': '919812345678',
            'boss': '919800000000'
        };
        
        const number = demoNumbers[name.toLowerCase()] || '';
        if (number) {
            const url = `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
            this.speakClean(`${name} কে message পাঠাচ্ছি`);
            setTimeout(() => window.open(url, '_blank'), 1000);
        } else {
            window.open('https://web.whatsapp.com', '_blank');
            this.speakClean("WhatsApp খুললাম darling");
        }
    }

    handleSMS() {
        const smsList = [
            "Rahim: Meeting confirm 5 PM",
            "Maa: Dinner ready, come home",
            "Bank: Your transaction successful"
        ];
        const sms = smsList[Math.floor(Math.random() * smsList.length)];
        this.speakClean(`নতুন SMS: ${sms}`);
    }

    saveNote(note) {
        const id = Date.now().toString();
        this.notes[id] = note;
        localStorage.setItem('notes', JSON.stringify(this.notes));
        this.speakClean("নোট সেভ করলাম");
    }

    showNotes() {
        if (Object.keys(this.notes).length) {
            const recent = Object.values(this.notes).slice(-2);
            this.speakClean(`তোমার নোট: ${recent.join(' আর ')}`);
        } else {
            this.speakClean("কোনো নোট নেই");
        }
    }

    async getWeather(city) {
        try {
            const res = await fetch(`https://wttr.in/${city}?format=%C+%t`);
            const weather = await res.text();
            this.speakClean(`${city} এর আবহাওয়া: ${weather}`);
        } catch {
            this.speakClean("আজ ভালো আবহাওয়া");
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
    console.log('AI Girlfriend - Always Listening Mode ON! 🎤');
});
