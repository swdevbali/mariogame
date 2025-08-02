// Audio Manager for Mario Game
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.isAudioEnabled = true;
        this.isMusicEnabled = true;
        this.backgroundMusic = null;
        
        this.init();
        this.setupControls();
    }
    
    init() {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create gain nodes for volume control
            this.masterGain = this.audioContext.createGain();
            this.musicGain = this.audioContext.createGain();
            this.sfxGain = this.audioContext.createGain();
            
            // Connect gain nodes
            this.musicGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);
            this.masterGain.connect(this.audioContext.destination);
            
            // Set initial volumes
            this.masterGain.gain.value = 0.7;
            this.musicGain.gain.value = 0.3;
            this.sfxGain.gain.value = 0.5;
            
        } catch (error) {
            console.log('Web Audio API not supported');
            this.isAudioEnabled = false;
        }
    }
    
    setupControls() {
        const soundToggle = document.getElementById('soundToggle');
        const musicToggle = document.getElementById('musicToggle');
        
        soundToggle.addEventListener('click', () => {
            this.toggleSounds();
        });
        
        musicToggle.addEventListener('click', () => {
            this.toggleMusic();
        });
    }
    
    // Resume audio context (required for mobile browsers)
    resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    // Create oscillator for sound effects
    createOscillator(frequency, type = 'square') {
        if (!this.audioContext) return null;
        
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        return oscillator;
    }
    
    // Create gain node for envelope control
    createGain() {
        if (!this.audioContext) return null;
        return this.audioContext.createGain();
    }
    
    // Jump sound effect
    playJumpSound() {
        if (!this.isAudioEnabled) return;
        this.resumeContext();
        
        const oscillator = this.createOscillator(400, 'square');
        const gain = this.createGain();
        
        if (!oscillator || !gain) return;
        
        oscillator.connect(gain);
        gain.connect(this.sfxGain);
        
        // Envelope
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
        
        // Frequency sweep
        oscillator.frequency.linearRampToValueAtTime(200, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    // Coin collection sound
    playCoinSound() {
        if (!this.isAudioEnabled) return;
        this.resumeContext();
        
        // Create a pleasant coin sound with multiple harmonics
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
        
        frequencies.forEach((freq, index) => {
            const oscillator = this.createOscillator(freq, 'sine');
            const gain = this.createGain();
            
            if (!oscillator || !gain) return;
            
            oscillator.connect(gain);
            gain.connect(this.sfxGain);
            
            // Staggered envelope for each note
            const startTime = this.audioContext.currentTime + (index * 0.05);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.4);
        });
    }
    
    // Enemy defeat sound
    playEnemyDefeatSound() {
        if (!this.isAudioEnabled) return;
        this.resumeContext();
        
        const oscillator = this.createOscillator(150, 'sawtooth');
        const gain = this.createGain();
        
        if (!oscillator || !gain) return;
        
        oscillator.connect(gain);
        gain.connect(this.sfxGain);
        
        // Descending frequency for defeat sound
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(80, this.audioContext.currentTime + 0.5);
        
        // Envelope
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.4, this.audioContext.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }
    
    // Player hit/death sound
    playHitSound() {
        if (!this.isAudioEnabled) return;
        this.resumeContext();
        
        // Create a harsh, dissonant sound
        const oscillator1 = this.createOscillator(200, 'sawtooth');
        const oscillator2 = this.createOscillator(187, 'square'); // Slightly detuned
        const gain = this.createGain();
        
        if (!oscillator1 || !oscillator2 || !gain) return;
        
        oscillator1.connect(gain);
        oscillator2.connect(gain);
        gain.connect(this.sfxGain);
        
        // Harsh envelope
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.01);
        gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.8);
        
        // Frequency modulation for more chaos
        oscillator1.frequency.linearRampToValueAtTime(100, this.audioContext.currentTime + 0.8);
        oscillator2.frequency.linearRampToValueAtTime(90, this.audioContext.currentTime + 0.8);
        
        oscillator1.start(this.audioContext.currentTime);
        oscillator2.start(this.audioContext.currentTime);
        oscillator1.stop(this.audioContext.currentTime + 0.8);
        oscillator2.stop(this.audioContext.currentTime + 0.8);
    }
    
    // Mario shoot sound
    playShootSound() {
        if (!this.isAudioEnabled) return;
        this.resumeContext();
        
        const oscillator = this.createOscillator(800, 'square');
        const gain = this.createGain();
        
        if (!oscillator || !gain) return;
        
        oscillator.connect(gain);
        gain.connect(this.sfxGain);
        
        // Quick sharp sound
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
        
        // Frequency sweep down for laser effect
        oscillator.frequency.linearRampToValueAtTime(600, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    // Enemy shoot sound
    playEnemyShootSound() {
        if (!this.isAudioEnabled) return;
        this.resumeContext();
        
        const oscillator = this.createOscillator(300, 'sawtooth');
        const gain = this.createGain();
        
        if (!oscillator || !gain) return;
        
        oscillator.connect(gain);
        gain.connect(this.sfxGain);
        
        // Growling enemy shot
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
        
        // Lower pitch for enemy
        oscillator.frequency.linearRampToValueAtTime(150, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    // Background music (simple melody loop)
    startBackgroundMusic() {
        if (!this.isMusicEnabled || !this.audioContext) return;
        this.resumeContext();
        
        this.stopBackgroundMusic(); // Stop any existing music
        
        // Mario-like melody notes (simplified)
        const melody = [
            { note: 329.63, duration: 0.2 }, // E4
            { note: 329.63, duration: 0.2 }, // E4
            { note: 0, duration: 0.2 },      // Rest
            { note: 329.63, duration: 0.2 }, // E4
            { note: 0, duration: 0.2 },      // Rest
            { note: 261.63, duration: 0.2 }, // C4
            { note: 329.63, duration: 0.2 }, // E4
            { note: 0, duration: 0.2 },      // Rest
            { note: 392.00, duration: 0.4 }, // G4
            { note: 0, duration: 0.4 },      // Rest
            { note: 196.00, duration: 0.4 }, // G3
            { note: 0, duration: 0.4 }       // Rest
        ];
        
        this.playMelodyLoop(melody);
    }
    
    playMelodyLoop(melody) {
        if (!this.isMusicEnabled) return;
        
        let currentTime = this.audioContext.currentTime;
        
        melody.forEach((note, index) => {
            if (note.note > 0) { // Only play if not a rest
                const oscillator = this.createOscillator(note.note, 'triangle');
                const gain = this.createGain();
                
                if (oscillator && gain) {
                    oscillator.connect(gain);
                    gain.connect(this.musicGain);
                    
                    // Soft envelope for music
                    gain.gain.setValueAtTime(0, currentTime);
                    gain.gain.linearRampToValueAtTime(0.1, currentTime + 0.02);
                    gain.gain.linearRampToValueAtTime(0.05, currentTime + note.duration - 0.02);
                    gain.gain.linearRampToValueAtTime(0, currentTime + note.duration);
                    
                    oscillator.start(currentTime);
                    oscillator.stop(currentTime + note.duration);
                }
            }
            currentTime += note.duration;
        });
        
        // Schedule next loop
        const totalDuration = melody.reduce((sum, note) => sum + note.duration, 0);
        this.backgroundMusic = setTimeout(() => {
            if (this.isMusicEnabled) {
                this.playMelodyLoop(melody);
            }
        }, totalDuration * 1000);
    }
    
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            clearTimeout(this.backgroundMusic);
            this.backgroundMusic = null;
        }
    }
    
    toggleSounds() {
        this.isAudioEnabled = !this.isAudioEnabled;
        const button = document.getElementById('soundToggle');
        
        if (this.isAudioEnabled) {
            button.textContent = '🔊';
            button.classList.remove('muted');
            this.sfxGain.gain.value = 0.5;
        } else {
            button.textContent = '🔇';
            button.classList.add('muted');
            this.sfxGain.gain.value = 0;
        }
    }
    
    toggleMusic() {
        this.isMusicEnabled = !this.isMusicEnabled;
        const button = document.getElementById('musicToggle');
        
        if (this.isMusicEnabled) {
            button.textContent = '🎵';
            button.classList.remove('muted');
            this.musicGain.gain.value = 0.3;
            this.startBackgroundMusic();
        } else {
            button.textContent = '🔇';
            button.classList.add('muted');
            this.musicGain.gain.value = 0;
            this.stopBackgroundMusic();
        }
    }
}

// Initialize audio manager
let audioManager;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    audioManager = new AudioManager();
    
    // Export for use in game.js
    window.audioManager = audioManager;
    
    // Start background music after a short delay
    setTimeout(() => {
        if (audioManager) {
            audioManager.startBackgroundMusic();
        }
    }, 1000);
});

// Also export immediately for cases where game.js loads first
window.audioManager = audioManager;