# Super Mario Mobile Game

Game Mario Bros sederhana yang dibuat dengan HTML5, CSS, dan JavaScript. Game ini dioptimalkan untuk dimainkan di handphone dengan kontrol sentuh.

## Fitur Game

- **Karakter Mario** yang bisa bergerak dan melompat
- **Platform jumping** dengan fisika realistis
- **Koin** untuk dikumpulkan (100 poin per koin)
- **Musuh (Goomba)** yang bisa dikalahkan dengan melompat di atasnya (200 poin)
- **Kontrol sentuh** yang responsif untuk mobile
- **Kamera yang mengikuti** pemain
- **Desain responsif** untuk berbagai ukuran layar
- **🎵 Sound Effects & Background Music**
  - Sound jump, coin collection, enemy defeat, player hit
  - Sound shooting untuk Mario dan musuh
  - Background music dengan melodi Mario-style
  - Kontrol audio terpisah untuk SFX dan musik
- **🔫 Combat System**
  - Mario bisa menembak peluru dengan tombol 🔥
  - Musuh AI menembak peluru ke arah Mario
  - Collision detection untuk peluru
  - Visual trail effects untuk peluru

## Cara Bermain

### Di Mobile/Handphone:
1. Buka file `index.html` di browser handphone
2. Gunakan tombol panah (← →) untuk bergerak kiri/kanan
3. Tekan tombol "JUMP" untuk melompat
4. Tekan tombol 🔥 untuk menembak peluru
5. Kumpulkan koin kuning untuk mendapat poin (100 pts)
6. Kalahkan musuh dengan melompat di atas mereka (200 pts)
7. Atau tembak musuh dengan peluru (300 pts)
8. Hindari peluru musuh dan jangan menyentuh musuh dari samping
9. **Kontrol Audio:**
   - 🔊 - Toggle sound effects on/off
   - 🎵 - Toggle background music on/off

### Di Desktop:
- Gunakan tombol panah atau WASD untuk bergerak
- Spasi atau panah atas untuk melompat
- X, Z, atau Ctrl untuk menembak peluru

## Cara Menjalankan

1. **Metode 1 - Buka langsung:**
   - Buka file `index.html` di browser

2. **Metode 2 - Local server (disarankan):**
   ```bash
   # Jika punya Python 3
   python -m http.server 8000
   
   # Jika punya Node.js
   npx serve .
   
   # Kemudian buka http://localhost:8000
   ```

## Teknologi yang Digunakan

- **HTML5 Canvas** - untuk rendering graphics
- **CSS3** - untuk styling dan responsive design
- **JavaScript ES6** - untuk game logic dan physics
- **Touch Events API** - untuk kontrol mobile
- **Web Audio API** - untuk sound effects dan background music

## Struktur File

```
mariogame/
├── index.html      # File utama HTML
├── style.css       # Styling dan responsive design
├── game.js         # Logic game dan physics
├── audio.js        # Audio manager dan sound effects
└── README.md       # Dokumentasi ini
```

## Fitur Mobile-Friendly

- **Responsive design** - menyesuaikan dengan ukuran layar
- **Touch controls** - tombol sentuh yang nyaman
- **Viewport optimization** - tidak bisa di-zoom untuk pengalaman gaming yang baik
- **Landscape/Portrait support** - bisa dimainkan dalam orientasi apa saja

## Pengembangan Selanjutnya

Fitur yang bisa ditambahkan:
- [ ] Level yang lebih banyak
- [ ] Power-ups (mushroom, fire flower)
- [x] Sound effects ✅
- [x] Background music ✅
- [ ] Local storage untuk high score
- [ ] Animasi sprite yang lebih bagus
- [ ] Lebih banyak jenis musuh
- [ ] Boss battles
- [ ] Particle effects
- [ ] Better graphics/sprites

## Browser Support

Game ini kompatibel dengan:
- Chrome/Safari mobile
- Firefox mobile
- Chrome/Firefox/Safari desktop
- Edge

---

**Selamat bermain!** 🎮