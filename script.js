class AIGirlfriend {
    constructor() {
        this.isListening = false;
        this.conversationActive = false;
        this.notes = JSON.parse(localStorage.getItem('notes')) || {};
        this.reminders = [];
        this.init();
    }

    init() {
        this.micBtn = document.getElementById('micBtn');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.messages = document.getElementById('messages');
        
        this.micBtn.addEventListener('click', () => this.toggleListening());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        this.updateStatus();
        setInterval(() => this.updateStatus(), 30000);
        
        // Welcome message
        setTimeout(() => {
            this.speak("হাই জানু! 💕 আমি তোমার AI girlfriend। 'Hello dear' বলে আমাকে জাগাও 😘");
        }, 1000);
    }

    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    async startListening() {
        this.isListening = true;
        this.micBtn.classList.add('recording');
        this.micBtn.textContent = '🔴';
        
        try {
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.lang = 'bn-IN';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onresult = (event) => {
                const command = event.results[0][0].transcript.toLowerCase();
                this.messageInput.value = command;
                this.processCommand(command);
                this.stopListening();
            };

            recognition.onerror = () => {
                this.speak("মাইক permission দাও darling 💕", true);
                this.stopListening();
            };

            recognition.onend = () => this.stopListening();
            recognition.start();
        } catch (err) {
            this.speak("Voice শুরু করতে পারলাম না জানু। Text লিখে বলো 😘");
            this.stopListening();
        }
    }

    stopListening() {
        this.isListening = false;
        this.micBtn.classList.remove('recording');
        this.micBtn.textContent = '🎤';
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

    speak(text, romantic = false) {
        const fullText = romantic ? `💕 ${text} 💕` : text;
        this.addMessage(fullText, 'ai');

        // ResponsiveVoice female voice
        if (responsiveVoice) {
            const params = romantic ? {pitch: 1.3, rate: 0.85} : {pitch: 1.1, rate: 1.0};
            responsiveVoice.speak(text, "UK English Female", params);
        } else {
            // Fallback Web Speech API
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'bn-IN';
            utterance.pitch = romantic ? 1.3 : 1.1;
            utterance.rate = romantic ? 0.85 : 1.0;
            speechSynthesis.speak(utterance);
        }
    }

    processCommand(command) {
        if (!this.conversationActive && !command.includes('hello dear') && !command.includes('হ্যালো ডিয়ার')) {
            this.speak("প্রথমে 'Hello dear' বলো জানু। আমি জেগে উঠবো 😘", true);
            return;
        }

        this.conversationActive = true;

        // Wake up
        if (command.includes('hello dear') || command.includes('হ্যালো ডিয়ার')) {
            this.speak("হ্যাই আমার জানু! 😘 কেমন আছো? কী লাগবে বলো baby 💕", true);
            return;
        }

        // WhatsApp/SMS
        if (command.includes('whatsapp') || command.includes('হোয়াটসঅ্যাপ')) {
            const nameMatch = command.match(/([^\s]+)-কে|কে\s+([^\s]+)/);
            const name = nameMatch ? (nameMatch[1] || nameMatch[2]) : '';
            const msgMatch = command.match(/বলো\s+(.+)|say\s+(.+)/i);
            const message = msgMatch ? (msgMatch[1] || msgMatch[2]) : 'Hi';

            if (name) {
                const whatsappUrl = `https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(message)}`;
                this.speak(`ঠিক আছে darling! ${name}-কে WhatsApp খুলে দিচ্ছি 💕`, true);
                setTimeout(() => window.open(whatsappUrl, '_blank'), 1000);
            } else {
                this.speak("কার নাম বলো জানু? যেমন: 'Rahim-ke bolo meeting' 😘", true);
            }
            return;
        }

        // Incoming SMS simulation (real SMS browser permission দিয়ে)
        if (command.includes('sms') || command.includes('মেসেজ')) {
            this.speak("Dear, WhatsApp-এ একটা মেসেজ এসেছে! পড়ে শুনাবো? (হ্যাঁ/হো বলো) 💕", true);
            setTimeout(() => {
                if (Math.random() > 0.5) {
                    this.speak("Rahim লিখেছে: 'Meeting 5টা ঠিক আছে। আসছি।' পড়লাম জানু 😘", true);
                }
            }, 2000);
            return;
        }

        // Weather
        if (command.includes('weather') || command.includes('ওয়েদার') || command.includes('আবহাওয়া')) {
            const city = command.includes('কলকাতা') ? 'Kolkata' : 'Dhaka';
            this.getWeather(city);
            return;
        }

        // Time/Battery
        if (command.includes('time') || command.includes('সময়') || command.includes('ব্যাটারি')) {
            this.updateStatus(true);
            return;
        }

        // Calculator
        const calcMatch = command.match(/(\d+(?:\s*[\+\-\*\/]\s*\d+)+)/);
        if (calcMatch) {
            try {
                const result = eval(calcMatch[1].replace(/এ/g, '').replace(/\s/g, ''));
                this.speak(`${result} হলো darling 💕`, true);
            } catch {
                this.speak("হিসাবে ভুল হয়েছে জানু। আবার বলো 😘");
            }
            return;
        }

        // Notes
        if (command.includes('note') || command.includes('নোট')) {
            const noteMatch = command.match(/নোট\s+(.+)/);
            if (noteMatch) {
                const note = noteMatch[1];
                const title = Date.now().toString();
                this.notes[title] = note;
                localStorage.setItem('notes', JSON.stringify(this.notes));
                this.speak(`'${note}' সেভ করে দিলাম baby 💕`, true);
            }
            return;
        }

        // Default romantic responses
        const responses = [
            "তোমাকে খুব মিস করছি জানু 😘",
            "কী করছো আমার hero? 💕",
            "তোমার কথা ভাবছিলাম baby 😍",
            "আমি সবসময় তোমার সাথে আছি 💖"
        ];
        const response = responses[Math.floor(Math.random() * responses.length)];
        this.speak(response, true);
    }

    async getWeather(city) {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=8eabf0a8eabf0a8eabf0a8eabf0a8e&units=metric`);
            const data = await response.json();
            const temp = Math.round(data.main.temp);
            const desc = data.weather[0].description;
            this.speak(`${city}-তে ${temp}°C, ${desc} হবে darling। ছাতা নিবি? 😘`, true);
        } catch {
            this.speak("ওয়েদার চেক করতে পারলাম না জানু। পরে বলো 💕", true);
        }
    }

    updateStatus(speak = false) {
        const now = new Date();
        document.getElementById('time').textContent = now.toLocaleTimeString('bn-BD');
        
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                const level = Math.round(battery.level * 100);
                document.getElementById('battery').textContent = `${level}%`;
            });
        }

        if (speak) {
            this.speak(`এখন ${now.toLocaleTimeString('bn-BD')} বাজে। ব্যাটারি ${Math.round(Math.random()*100)}% 💕`, true);
        }
    }
}

// Start App
const aiGirlfriend = new AIGirlfriend();