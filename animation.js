const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const coinsElement = document.getElementById('coins');
const livesElement = document.getElementById('lives');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game state
let score = 0;
let coins = 0;
let lives = 3;
let gameOver = false;
let lastSpawnTime = 0;
const spawnInterval = 2000; // Spawn new ball every 2 seconds

// Paddle properties
const paddle = {
    width: 100,
    height: 20,
    x: canvas.width / 2 - 50,
    y: canvas.height - 40,
    speed: 8,
    dx: 0
};

// Ball types
const BALL_TYPES = {
    NORMAL: { color: '#FF69B4', points: 10, isDangerous: false, isCoin: false },
    SPECIAL: { color: '#9370DB', points: 20, isDangerous: false, isCoin: false },
    DANGEROUS: { color: '#FF0000', points: 0, isDangerous: true, isCoin: false },
    COIN: { color: '#FFD700', points: 50, isDangerous: false, isCoin: true }
};

// Ball class
class Ball {
    constructor(x, y, radius, type) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.type = type;
        this.color = type.color;
        this.dx = (Math.random() - 0.5) * 8;
        this.dy = (Math.random() - 0.5) * 8;
        this.gravity = 0.02;
        this.friction = 0.998;
        this.bounce = 0.98;
        this.mass = radius;
        this.active = true;
    }

    draw() {
        if (!this.active) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        // Draw coin symbol for coin balls
        if (this.type.isCoin) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = '#FFF';
            ctx.fill();
            ctx.closePath();
        }
    }

    update(balls) {
        if (!this.active) return;

        // Apply gravity
        this.dy += this.gravity;
        
        // Apply friction
        this.dx *= this.friction;
        this.dy *= this.friction;

        // Check paddle collision
        if (this.y + this.radius > paddle.y && 
            this.x > paddle.x && 
            this.x < paddle.x + paddle.width) {
            
            if (this.type.isDangerous) {
                lives--;
                livesElement.textContent = lives;
                this.active = false;
                checkGameOver();
                return;
            }

            if (this.type.isCoin) {
                coins += this.type.points;
                coinsElement.textContent = coins;
                this.active = false;
                return;
            }

            this.dy = -Math.abs(this.dy) * this.bounce;
            score += this.type.points;
            scoreElement.textContent = score;
        }

        // Check if ball is below paddle
        if (this.y + this.radius > canvas.height) {
            if (!this.type.isCoin) {
                this.active = false;
                checkGameOver();
            }
            return;
        }

        // Bounce off walls
        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.dx = -this.dx * this.bounce;
        } else if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.dx = -this.dx * this.bounce;
        }

        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.dy = -this.dy * this.bounce;
        }

        // Check collision with other balls
        for (let ball of balls) {
            if (ball === this || !ball.active) continue;

            const dx = ball.x - this.x;
            const dy = ball.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.radius + ball.radius) {
                const angle = Math.atan2(dy, dx);
                const sin = Math.sin(angle);
                const cos = Math.cos(angle);

                const vx1 = this.dx * cos + this.dy * sin;
                const vy1 = this.dy * cos - this.dx * sin;
                const vx2 = ball.dx * cos + ball.dy * sin;
                const vy2 = ball.dy * cos - ball.dx * sin;

                const finalVx1 = ((this.mass - ball.mass) * vx1 + 2 * ball.mass * vx2) / (this.mass + ball.mass) * 0.98;
                const finalVx2 = ((ball.mass - this.mass) * vx2 + 2 * this.mass * vx1) / (this.mass + ball.mass) * 0.98;

                this.dx = finalVx1 * cos - vy1 * sin;
                this.dy = vy1 * cos + finalVx1 * sin;
                ball.dx = finalVx2 * cos - vy2 * sin;
                ball.dy = vy2 * cos + finalVx2 * sin;

                const overlap = (this.radius + ball.radius - distance) / 2;
                this.x -= overlap * cos;
                this.y -= overlap * sin;
                ball.x += overlap * cos;
                ball.y += overlap * sin;
            }
        }

        // Update position
        this.x += this.dx;
        this.y += this.dy;

        this.draw();
    }
}

// Create initial balls
const balls = [];
const numInitialBalls = 10;

function createBall() {
    const radius = Math.random() * 20 + 10;
    const x = Math.random() * (canvas.width - radius * 2) + radius;
    const y = -radius;
    
    // Randomly choose ball type
    const types = Object.values(BALL_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    
    balls.push(new Ball(x, y, radius, type));
}

// Spawn initial balls
for (let i = 0; i < numInitialBalls; i++) {
    createBall();
}

// Draw paddle
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = '#FF69B4';
    ctx.fill();
    ctx.closePath();
}

// Check game over
function checkGameOver() {
    if (lives <= 0) {
        gameOver = true;
        finalScoreElement.textContent = `Score: ${score} | Coins: ${coins}`;
        gameOverElement.style.display = 'block';
    }
}

// Restart game
function restartGame() {
    score = 0;
    coins = 0;
    lives = 3;
    gameOver = false;
    balls.length = 0;
    scoreElement.textContent = score;
    coinsElement.textContent = coins;
    livesElement.textContent = lives;
    gameOverElement.style.display = 'none';
    
    // Create new initial balls
    for (let i = 0; i < numInitialBalls; i++) {
        createBall();
    }
}

// Handle keyboard input
document.addEventListener('keydown', (e) => {
    if (gameOver) return;
    if (e.key === 'ArrowLeft') {
        paddle.dx = -paddle.speed;
    }
    if (e.key === 'ArrowRight') {
        paddle.dx = paddle.speed;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        paddle.dx = 0;
    }
});

// Update paddle position
function updatePaddle() {
    paddle.x += paddle.dx;

    // Keep paddle within canvas
    if (paddle.x < 0) {
        paddle.x = 0;
    }
    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!gameOver) {
        updatePaddle();
        drawPaddle();
        
        // Spawn new balls
        const currentTime = Date.now();
        if (currentTime - lastSpawnTime > spawnInterval) {
            createBall();
            lastSpawnTime = currentTime;
        }
        
        balls.forEach(ball => {
            ball.update(balls);
        });
    }

    requestAnimationFrame(animate);
}

animate(); 