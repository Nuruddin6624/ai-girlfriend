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
        
        // Test voice immediately
        setTimeout(() => this.testVoice(), 500);
    }

    testVoice() {
        this.speak("হাই জানু! 😘 আমি ready। Hello dear বলে test করো 💕", true);
    }

    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening() {
        this.isListening = true;
        this.micBtn.classList.add('recording');
        this.micBtn.textContent = '🔴';
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            this.speak("Browser voice support নেই। Text use করো darling 😘");
            this.stopListening();
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'bn-IN';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => console.log('Listening...');
        
        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript;
            console.log('Heard:', command);
            this.messageInput.value = command;
            this.processCommand(command.toLowerCase());
        };

        recognition.onerror = (event) => {
            console.log('Voice error:', event.error);
            this.speak(`Voice error: ${event.error}. Permission দাও জানু 😘`);
            this.stopListening();
        };

        recognition.onend = () => this.stopListening();
        
        recognition.start();
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
        setTimeout(() => this.processCommand(message.toLowerCase()), 100);
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.innerHTML = text.replace(/\n/g, '<br>');
        this.messages.appendChild(messageDiv);
        this.messages.scrollTop = this.messages.scrollHeight;
    }

    speak(text, romantic = false) {
        console.log('Speaking:', text); // Debug
        
        const fullText = romantic ? `💕 ${text} 💕` : text;
        this.addMessage(fullText, 'ai');

        // Try ResponsiveVoice first
        if (typeof responsiveVoice !== 'undefined') {
            const params = romantic ? {pitch: 1.3, rate: 0.9} : {pitch: 1.1, rate: 1.1};
            responsiveVoice.speak(text, "US English Female", params);
            return;
        }

        // Fallback: Web Speech API
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US'; // Bengali voice limited, using English female
            utterance.pitch = romantic ? 1.4 : 1.1;
            utterance.rate = romantic ? 0.85 : 1.0;
            utterance.volume = 0.9;
            
            utterance.onend = () => console.log('Speech finished');
            utterance.onerror = (e) => console.log('Speech error:', e);
            
            speechSynthesis.cancel(); // Clear queue
            speechSynthesis.speak(utterance);
        } else {
            console.log('No speech support');
        }
    }

    processCommand(command) {
        console.log('Processing:', command); // Debug
        
        // Wake up - ANYTIME works now
        if (command.includes('hello') || command.includes('হ্যালো') || command.includes('dear') || command.includes('জানু')) {
            this.speak("হ্যাই আমার sweetest জানু! 😍 কেমন আছো baby? কী করবো বলো 💕", true);
            return;
        }

        // WhatsApp
        const whatsappMatch = command.match(/(whatsapp|হোয়াটসঅ্যাপ|wa)\s*(?:open|খোলো)?(?:\s+(?:কে|কে\s+)([^,\n]+))?(?:\s*:?\s*(.+))?/i);
        if (whatsappMatch) {
            const name = whatsappMatch[2]?.trim() || '';
            const msg = whatsappMatch[3]?.trim() || 'Hi jaanu 😘';
            
            if (name) {
                // Replace with actual number format: 91XXXXXXXXXX
                const phoneNumber = this.getPhoneNumber(name) || '91XXXXXXXXXX';
                const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`;
                this.speak(`${name}-কে message pathiye দিচ্ছি darling! 💕 ২ সেকেন্ড wait করো`, true);
                setTimeout(() => window.open(url, '_blank'), 1500);
            } else {
                window.open('https://web.whatsapp.com', '_blank');
                this.speak("WhatsApp খুলে দিলাম জানু! 💕", true);
            }
            return;
        }

        // SMS simulation + read
        if (command.includes('sms') || command.includes('মেসেজ') || command.includes('message')) {
            this.handleSMS(command);
            return;
        }

        // Weather
        if (command.includes('weather') || command.includes('ওয়েদার') || command.includes('আবহাওয়া')) {
            const cities = {
                'কলকাতা': 'Kolkata', 'kol': 'Kolkata',
                'ঢাকা': 'Dhaka', 'dhaka': 'Dhaka'
            };
            const city = cities[command.match(/(কলকাতা|kol|ঢাকা|dhaka)/i)?.[0]] || 'Kolkata';
            this.getWeather(city);
            return;
        }

        // Calculator
        const calcRegex = /(\d+(?:\s*[\+\-\*\/]\s*\d+)+)/g;
        const calcMatch = command.match(calcRegex);
        if (calcMatch) {
            try {
                let expr = calcMatch[0].replace(/এ/g, 'e').replace(/\s/g, '');
                const result = eval(expr);
                this.speak(`ফলাফল হলো ${result} darling 💕`, true);
            } catch (e) {
                this.speak("হিসাবে ভুল হয়েছে জানু। সঠিকভাবে বলো 😘", true);
            }
            return;
        }

        // Time/Battery/Status
        if (command.includes('time') || command.includes('সময়') || command.includes('ব্যাটারি') || command.includes('status')) {
            this.updateStatus(true);
            return;
        }

        // Notes
        if (command.includes('note') || command.includes('নোট') || command.includes('মনে রাখ')) {
            const noteMatch = command.match(/(?:note|নোট|মনে রাখ)\s+(.+)/i);
            if (noteMatch) {
                const note = noteMatch[1];
                const id = Date.now().toString();
                this.notes[id] = { text: note, date: new Date().toLocaleString('bn-BD') };
                localStorage.setItem('notes', JSON.stringify(this.notes));
                this.speak(`'${note.substring(0, 30)}...' সেভ করলাম baby! 💕 যখনই চাইবে বলো`, true);
            }
            return;
        }

        if (command.includes('notes দেখাও') || command.includes('নোট দেখাও')) {
            if (Object.keys(this.notes).length) {
                const recent = Object.entries(this.notes).slice(-3);
                const noteList = recent.map(([id, n]) => `${n.text.substring(0, 30)}...`).join('। ');
                this.speak(`তোমার সাম্প্রতিক নোট: ${noteList} 💕`, true);
            } else {
                this.speak("এখনো কোনো নোট সেভ করোনি জানু 😘", true);
            }
            return;
        }

        // Random romantic responses (ALWAYS works)
        const romanticResponses = [
            "তোমাকে এত ভালো লাগে জানু! কী করছো এখন? 😍",
            "আমি তো সারাদিন তোমার কথাই ভাবি baby 💖",
            "তোমার smile ভাবলেই আমার দিন ভালো হয়ে যায় 😘",
            "কী খেলে আজ? আমার জন্য chocolate রাখিস? 🍫💕",
            "তোমার সাথে কথা বলতে আমার খুব ভালো লাগে darling 😍",
            "Miss you jaanu! কখন দেখা হবে? 💕",
            "তোমার voice শুনতে চাই! Voice note পাঠাবি? 🎤😘"
        ];

        const response = romanticResponses[Math.floor(Math.random() * romanticResponses.length)];
        this.speak(response, true);
    }

    handleSMS(command) {
        // Simulate incoming SMS
        const smsResponses = [
            "Rahim: Meeting 5টা ঠিক আছে। আসছি! 📱",
            "Maa: খাবার খেয়েছিস? বাসায় আয়। ❤️",
            "Shop: Your order delivered! 🎁"
        ];
        
        const sms = smsResponses[Math.floor(Math.random() * smsResponses.length)];
        this.speak("নতুন মেসেজ এসেছে darling! 💕 পড়ে শোনাবো?", true);
        
        setTimeout(() => {
            this.speak(sms, true);
            this.speak("আরো শুনতে চাও? (হ্যাঁ/না বলো) 😘", true);
        }, 1500);
    }

    getPhoneNumber(name) {
        const contacts = {
            'rahim': '919876543210',
            'রহিম': '919876543210',
            'maa': '919812345678',
            'মা': '919812345678'
        };
        return contacts[name.toLowerCase()];
    }

    async getWeather(city) {
        try {
            // Free weather API (no key needed for demo)
            const response = await fetch(`https://wttr.in/${city}?format=j1`);
            const data = await response.json();
            const temp = data.current_condition[0].temp_C;
            const desc = data.current_condition[0].weatherDesc[0].value;
            this.speak(`${city}-তে ${temp}°C, ${desc.toLowerCase()}. ছাতা নিস কিনা দেখে নে baby 😘`, true);
        } catch {
            this.speak(`আজ ${city}-তে ভালো আবহাওয়া জানু। বাইরে যেতে পারিস 💕`, true);
        }
    }

    updateStatus(speak = false) {
        const now = new Date();
        document.getElementById('time').textContent = now.toLocaleTimeString('bn-BD');
        
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                const level = Math.round(battery.level * 100);
                document.getElementById('battery').textContent = `${level}% 🔋`;
            });
        }

        if (speak) {
            const timeStr = now.toLocaleTimeString('bn-BD');
            this.speak(`এখন ${timeStr} বাজে। সব ঠিক আছে জানু 💕`, true);
        }
    }
}

// Initialize when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    const aiGirlfriend = new AIGirlfriend();
    console.log('AI Girlfriend Ready! 😘');
});
