// Game setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 80; // Account for header and controls
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game variables
let score = 0;
let gameSpeed = 1;
let keys = {};

// Bullet system
let marioBullets = [];
let enemyBullets = [];
let lastShotTime = 0;
let shootCooldown = 300; // milliseconds

// Player object (Mario)
const player = {
    x: 50,
    y: 200,
    width: 30,
    height: 40,
    velX: 0,
    velY: 0,
    speed: 5,
    jumpPower: 15,
    grounded: false,
    color: '#FF0000'
};

// Platforms
const platforms = [
    { x: 0, y: canvas.height - 50, width: canvas.width, height: 50, color: '#8B4513' },
    { x: 200, y: canvas.height - 150, width: 150, height: 20, color: '#228B22' },
    { x: 400, y: canvas.height - 250, width: 150, height: 20, color: '#228B22' },
    { x: 600, y: canvas.height - 180, width: 100, height: 20, color: '#228B22' },
    { x: 800, y: canvas.height - 300, width: 120, height: 20, color: '#228B22' },
    { x: 1000, y: canvas.height - 200, width: 100, height: 20, color: '#228B22' }
];

// Coins
let coins = [
    { x: 250, y: canvas.height - 200, width: 20, height: 20, collected: false },
    { x: 450, y: canvas.height - 300, width: 20, height: 20, collected: false },
    { x: 630, y: canvas.height - 230, width: 20, height: 20, collected: false },
    { x: 850, y: canvas.height - 350, width: 20, height: 20, collected: false },
    { x: 1030, y: canvas.height - 250, width: 20, height: 20, collected: false }
];

// Enemies (Goombas)
let enemies = [
    { x: 300, y: canvas.height - 90, width: 25, height: 25, velX: -1, color: '#8B4513' },
    { x: 500, y: canvas.height - 290, width: 25, height: 25, velX: -1, color: '#8B4513' },
    { x: 750, y: canvas.height - 220, width: 25, height: 25, velX: 1, color: '#8B4513' }
];

// Camera offset for scrolling
let camera = { x: 0 };

// Input handling
const controls = {
    left: false,
    right: false,
    jump: false,
    shoot: false
};

// Bullet class
class Bullet {
    constructor(x, y, velX, velY, color, isPlayerBullet = true) {
        this.x = x;
        this.y = y;
        this.velX = velX;
        this.velY = velY;
        this.width = 8;
        this.height = 4;
        this.color = color;
        this.isPlayerBullet = isPlayerBullet;
        this.trail = []; // For visual trail effect
    }
    
    update() {
        // Store position for trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 5) {
            this.trail.shift();
        }
        
        // Update position
        this.x += this.velX;
        this.y += this.velY;
        
        // Apply slight gravity to enemy bullets
        if (!this.isPlayerBullet) {
            this.velY += 0.2;
        }
    }
    
    isOffScreen() {
        return this.x < -50 || this.x > canvas.width + 50 || 
               this.y < -50 || this.y > canvas.height + 50;
    }
}

// Touch controls
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const jumpBtn = document.getElementById('jumpBtn');
const shootBtn = document.getElementById('shootBtn');

// Touch event handlers
function addTouchEvents(element, action) {
    element.addEventListener('touchstart', (e) => {
        e.preventDefault();
        controls[action] = true;
        // Resume audio context on first touch (required for mobile)
        if (window.audioManager) {
            window.audioManager.resumeContext();
        }
    });
    
    element.addEventListener('touchend', (e) => {
        e.preventDefault();
        controls[action] = false;
    });
    
    element.addEventListener('mousedown', (e) => {
        e.preventDefault();
        controls[action] = true;
    });
    
    element.addEventListener('mouseup', (e) => {
        e.preventDefault();
        controls[action] = false;
    });
}

addTouchEvents(leftBtn, 'left');
addTouchEvents(rightBtn, 'right');
addTouchEvents(jumpBtn, 'jump');
addTouchEvents(shootBtn, 'shoot');

// Keyboard controls (for desktop testing)
document.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'ArrowLeft':
        case 'KeyA':
            controls.left = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            controls.right = true;
            break;
        case 'Space':
        case 'ArrowUp':
        case 'KeyW':
            controls.jump = true;
            e.preventDefault();
            break;
        case 'KeyX':
        case 'KeyZ':
        case 'ControlLeft':
        case 'ControlRight':
            controls.shoot = true;
            e.preventDefault();
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch(e.code) {
        case 'ArrowLeft':
        case 'KeyA':
            controls.left = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            controls.right = false;
            break;
        case 'Space':
        case 'ArrowUp':
        case 'KeyW':
            controls.jump = false;
            break;
        case 'KeyX':
        case 'KeyZ':
        case 'ControlLeft':
        case 'ControlRight':
            controls.shoot = false;
            break;
    }
});

// Collision detection
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Update player
function updatePlayer() {
    // Handle input
    if (controls.left) {
        player.velX = -player.speed;
    } else if (controls.right) {
        player.velX = player.speed;
    } else {
        player.velX *= 0.8; // Friction
    }
    
    if (controls.jump && player.grounded) {
        player.velY = -player.jumpPower;
        player.grounded = false;
        // Play jump sound
        if (window.audioManager) {
            window.audioManager.playJumpSound();
        }
    }
    
    // Handle shooting
    if (controls.shoot) {
        const currentTime = Date.now();
        if (currentTime - lastShotTime > shootCooldown) {
            // Create bullet
            const bulletX = player.x + player.width;
            const bulletY = player.y + player.height / 2;
            const bulletVelX = player.velX > 0 ? 8 : (player.velX < 0 ? -8 : 8); // Shoot in movement direction
            const bullet = new Bullet(bulletX, bulletY, bulletVelX, 0, '#FFD700', true);
            marioBullets.push(bullet);
            
            lastShotTime = currentTime;
            
            // Play shoot sound
            if (window.audioManager) {
                window.audioManager.playShootSound();
            }
        }
    }
    
    // Apply gravity
    player.velY += 0.8;
    
    // Update position
    player.x += player.velX;
    player.y += player.velY;
    
    // Check platform collisions
    player.grounded = false;
    
    for (let platform of platforms) {
        if (isColliding(player, platform)) {
            // Landing on top of platform
            if (player.velY > 0 && player.y < platform.y) {
                player.y = platform.y - player.height;
                player.velY = 0;
                player.grounded = true;
            }
            // Hit platform from below
            else if (player.velY < 0 && player.y > platform.y) {
                player.y = platform.y + platform.height;
                player.velY = 0;
            }
            // Hit platform from side
            else if (player.velX > 0) {
                player.x = platform.x - player.width;
                player.velX = 0;
            } else if (player.velX < 0) {
                player.x = platform.x + platform.width;
                player.velX = 0;
            }
        }
    }
    
    // Check coin collisions
    for (let coin of coins) {
        if (!coin.collected && isColliding(player, coin)) {
            coin.collected = true;
            score += 100;
            document.getElementById('score').textContent = score;
            // Play coin sound
            if (window.audioManager) {
                window.audioManager.playCoinSound();
            }
        }
    }
    
    // Check enemy collisions
    for (let enemy of enemies) {
        if (isColliding(player, enemy)) {
            // Jump on enemy (defeat it)
            if (player.velY > 0 && player.y < enemy.y) {
                enemy.defeated = true;
                player.velY = -8; // Bounce
                score += 200;
                document.getElementById('score').textContent = score;
                // Play enemy defeat sound
                if (window.audioManager) {
                    window.audioManager.playEnemyDefeatSound();
                }
            } else {
                // Player hit by enemy - reset position
                player.x = 50;
                player.y = 200;
                player.velX = 0;
                player.velY = 0;
                camera.x = 0;
                // Play hit sound
                if (window.audioManager) {
                    window.audioManager.playHitSound();
                }
            }
        }
    }
    
    // Keep player in bounds
    if (player.x < 0) player.x = 0;
    if (player.y > canvas.height) {
        // Player fell - reset
        player.x = 50;
        player.y = 200;
        player.velX = 0;
        player.velY = 0;
        camera.x = 0;
        // Play hit sound for falling
        if (window.audioManager) {
            window.audioManager.playHitSound();
        }
    }
    
    // Check if player hit by enemy bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        let bullet = enemyBullets[i];
        if (isColliding(player, bullet)) {
            // Player hit by enemy bullet
            enemyBullets.splice(i, 1);
            player.x = 50;
            player.y = 200;
            player.velX = 0;
            player.velY = 0;
            camera.x = 0;
            // Play hit sound
            if (window.audioManager) {
                window.audioManager.playHitSound();
            }
        }
    }
    
    // Update camera to follow player
    camera.x = player.x - canvas.width / 3;
    if (camera.x < 0) camera.x = 0;
}

// Update enemies
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];
        
        if (enemy.defeated) {
            enemies.splice(i, 1);
            continue;
        }
        
        enemy.x += enemy.velX;
        
        // Simple AI - turn around at platform edges
        let onPlatform = false;
        for (let platform of platforms) {
            if (enemy.x + enemy.width > platform.x && 
                enemy.x < platform.x + platform.width &&
                enemy.y + enemy.height >= platform.y &&
                enemy.y + enemy.height <= platform.y + 20) {
                onPlatform = true;
                break;
            }
        }
        
        if (!onPlatform || enemy.x <= 0) {
            enemy.velX *= -1;
        }
        
        // Enemy shooting AI
        if (!enemy.lastShotTime) enemy.lastShotTime = 0;
        const currentTime = Date.now();
        const distanceToPlayer = Math.abs(enemy.x - player.x);
        
        // Shoot if player is nearby and visible
        if (distanceToPlayer < 300 && currentTime - enemy.lastShotTime > 2000) { // Shoot every 2 seconds
            const bulletX = enemy.x + enemy.width / 2;
            const bulletY = enemy.y + enemy.height / 2;
            const directionX = player.x > enemy.x ? 4 : -4;
            const directionY = Math.random() * 2 - 1; // Slight random vertical aim
            
            const bullet = new Bullet(bulletX, bulletY, directionX, directionY, '#FF4444', false);
            enemyBullets.push(bullet);
            
            enemy.lastShotTime = currentTime;
            
            // Play enemy shoot sound
            if (window.audioManager) {
                window.audioManager.playEnemyShootSound();
            }
        }
        
        // Check if enemy hit by player bullets
        for (let j = marioBullets.length - 1; j >= 0; j--) {
            let bullet = marioBullets[j];
            if (isColliding(enemy, bullet)) {
                // Enemy hit by player bullet
                marioBullets.splice(j, 1);
                enemy.defeated = true;
                score += 300; // More points for shooting
                document.getElementById('score').textContent = score;
                
                // Play enemy defeat sound
                if (window.audioManager) {
                    window.audioManager.playEnemyDefeatSound();
                }
                break;
            }
        }
    }
}

// Update bullets
function updateBullets() {
    // Update Mario bullets
    for (let i = marioBullets.length - 1; i >= 0; i--) {
        let bullet = marioBullets[i];
        bullet.update();
        
        // Check if bullet hit platform
        for (let platform of platforms) {
            if (isColliding(bullet, platform)) {
                marioBullets.splice(i, 1);
                break;
            }
        }
        
        // Remove bullets that are off screen
        if (bullet.isOffScreen()) {
            marioBullets.splice(i, 1);
        }
    }
    
    // Update enemy bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        let bullet = enemyBullets[i];
        bullet.update();
        
        // Check if bullet hit platform
        for (let platform of platforms) {
            if (isColliding(bullet, platform)) {
                enemyBullets.splice(i, 1);
                break;
            }
        }
        
        // Remove bullets that are off screen
        if (bullet.isOffScreen()) {
            enemyBullets.splice(i, 1);
        }
    }
}

// Render functions
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x - camera.x, y, width, height);
}

function drawPlayer() {
    // Draw Mario as a simple character
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x - camera.x, player.y, player.width, player.height);
    
    // Add simple details
    ctx.fillStyle = '#0000FF'; // Blue overalls
    ctx.fillRect(player.x - camera.x + 5, player.y + 15, player.width - 10, player.height - 15);
    
    // Hat
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(player.x - camera.x + 5, player.y, player.width - 10, 10);
}

function drawPlatforms() {
    for (let platform of platforms) {
        drawRect(platform.x, platform.y, platform.width, platform.height, platform.color);
        
        // Add grass texture
        if (platform.color === '#228B22') {
            ctx.fillStyle = '#32CD32';
            ctx.fillRect(platform.x - camera.x, platform.y, platform.width, 5);
        }
    }
}

function drawCoins() {
    for (let coin of coins) {
        if (!coin.collected) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(coin.x + coin.width/2 - camera.x, coin.y + coin.height/2, coin.width/2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawEnemies() {
    for (let enemy of enemies) {
        if (!enemy.defeated) {
            drawRect(enemy.x, enemy.y, enemy.width, enemy.height, enemy.color);
            
            // Add simple face
            ctx.fillStyle = '#000000';
            ctx.fillRect(enemy.x - camera.x + 5, enemy.y + 5, 3, 3);
            ctx.fillRect(enemy.x - camera.x + 15, enemy.y + 5, 3, 3);
        }
    }
}

function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.7);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.7);
    
    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);
    
    // Simple clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 5; i++) {
        let cloudX = (i * 300 + 100) - (camera.x * 0.3); // Parallax effect
        let cloudY = 50 + Math.sin(i) * 30;
        
        ctx.beginPath();
        ctx.arc(cloudX, cloudY, 25, 0, Math.PI * 2);
        ctx.arc(cloudX + 25, cloudY, 35, 0, Math.PI * 2);
        ctx.arc(cloudX + 50, cloudY, 25, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawBullets() {
    // Draw Mario bullets
    for (let bullet of marioBullets) {
        // Draw trail
        for (let i = 0; i < bullet.trail.length; i++) {
            const alpha = (i + 1) / bullet.trail.length * 0.5;
            ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            const trailPos = bullet.trail[i];
            ctx.fillRect(trailPos.x - camera.x - 1, trailPos.y - 1, 3, 3);
        }
        
        // Draw bullet
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x - camera.x, bullet.y, bullet.width, bullet.height);
        
        // Add glow effect
        ctx.shadowColor = bullet.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(bullet.x - camera.x, bullet.y, bullet.width, bullet.height);
        ctx.shadowBlur = 0;
    }
    
    // Draw enemy bullets
    for (let bullet of enemyBullets) {
        // Draw trail
        for (let i = 0; i < bullet.trail.length; i++) {
            const alpha = (i + 1) / bullet.trail.length * 0.5;
            ctx.fillStyle = `rgba(255, 68, 68, ${alpha})`;
            const trailPos = bullet.trail[i];
            ctx.fillRect(trailPos.x - camera.x - 1, trailPos.y - 1, 3, 3);
        }
        
        // Draw bullet
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x - camera.x, bullet.y, bullet.width, bullet.height);
        
        // Add glow effect
        ctx.shadowColor = bullet.color;
        ctx.shadowBlur = 6;
        ctx.fillRect(bullet.x - camera.x, bullet.y, bullet.width, bullet.height);
        ctx.shadowBlur = 0;
    }
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update
    updatePlayer();
    updateEnemies();
    updateBullets();
    
    // Draw
    drawBackground();
    drawPlatforms();
    drawCoins();
    drawEnemies();
    drawBullets();
    drawPlayer();
    
    // Continue loop
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();