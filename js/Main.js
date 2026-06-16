const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const levelDisplay = document.getElementById('level-display');
const livesContainer = document.getElementById('lives-container');
const scoreDisplay = document.getElementById('score-display');
const staminaBar = document.getElementById('stamina-bar');

const WIDTH = 600;
const HEIGHT = 800;
const GRID_SIZE = 20; 
canvas.width = WIDTH;
canvas.height = HEIGHT;

let gameState = 'START';
let level = 1;
let lives = 3;
let stamina = 100;
let sonarActive = false;
let sonarWaves = [];
let powerUpActive = false;

let score = 0;
let displayedScore = 0;
let nextLifeThreshold = 1000;

let caveBackground = [];
let particles = [];
let floatingTexts = [];

const GRAVITY = 0.4;
const JUMP_FORCE = -8.5;
const SPEED = 4;

const COLORS = {
	batBody: '#4a235a',
	batWing: '#633974',
	batEye: '#00ffff',
	platform: '#2c3e50',
	platformLip: '#34495e',
	door: '#f1c40f',
	owlBody: '#f8f9f9',
	owlFace: '#ffffff',
	owlBeak: '#f39c12',
	owlEyeAlert: '#ff0000',
	bg: '#0a0a1a',
	rock1: '#1a1a2e',
	rock2: '#16213e',
	insect: '#a3e4d7'
};

function updateLivesUI() {
	livesContainer.innerHTML = '🦇'.repeat(lives);
}

function generateBackground() {
	caveBackground = [];
	for (let y = 0; y < HEIGHT; y += GRID_SIZE) {
		for (let x = 0; x < WIDTH; x += GRID_SIZE) {
			if (Math.random() > 0.7) {
				caveBackground.push({
					x: x,
					y: y,
					color: Math.random() > 0.5 ? COLORS.rock1 : COLORS.rock2,
					size: GRID_SIZE + (Math.random() * 10 - 5)
				});
			}
		}
	}
}

const player = new Player();
let platforms = [];
let drones = [];
let insect = null;
let door = { x: 0, y: 0, w: 40, h: 60 };

const keys = {};

window.addEventListener('keydown', e => {
	if (e.code === 'ArrowUp' && gameState === 'PLAYING') {
		if (player.jumpCount < 3) {
			player.vy = JUMP_FORCE;
			player.jumpCount++;
			player.grounded = false;
		}
	}
	keys[e.code] = true;
	if (e.code === 'Space') sonarActive = true;
});

window.addEventListener('keyup', e => {
	keys[e.code] = false;
	if (e.code === 'Space') sonarActive = false;
});

function initLevel() {
	generateBackground();
	platforms = [];
	drones = [];
	particles = [];
	floatingTexts = [];
	platforms.push(new Platform(0, HEIGHT - 40, WIDTH, 40));
	
	let currentY = HEIGHT - 140;
	let pCounter = 0;
	let randomPlatformIndex = 1 + Math.floor(Math.random() * 4); 
	
	while (currentY > 100) {
		let w = 100 + Math.random() * 60;
		let x = Math.random() * (WIDTH - w);
		let p = new Platform(x, currentY, w, 20);
		platforms.push(p);
		pCounter++;
		if (pCounter === randomPlatformIndex) {
			insect = new Insect(x + w/2 - 8, currentY - 30);
		}
		currentY -= 150 + Math.random() * 50;
	}
	
	let lastPlat = platforms[platforms.length - 1];
	door.x = lastPlat.x + lastPlat.w/2 - 20;
	door.y = lastPlat.y - 65;
	
	let numDrones = Math.min(level, 5);
	for (let i = 0; i < numDrones; i++) {
		drones.push(new Drone(WIDTH/2, 200 + Math.random() * (HEIGHT - 400)));
	}
	
	player.reset();
	gameState = 'PLAYING';
	levelDisplay.innerText = level;
	updateLivesUI();
}

function loseLife() {
	lives--;
	updateLivesUI();
	if (lives <= 0) {
		gameOver();
        } else {
		player.reset();
		player.invulnerableTimer = 300; 
	}
}

function gameOver() {
	gameState = 'GAMEOVER';
	overlayTitle.innerText = "GAME OVER";
	overlayTitle.style.color = "#ff0000";
	overlay.style.display = 'flex';
	startBtn.innerText = "RIPROVA";
}

function update() {
	// Se siamo nel menu aggiorniamo solo il giocatore per l'animazione
	if (gameState === 'START' || gameState === 'GAMEOVER') {
		player.update();
		return;
	}
	
	if (displayedScore < score) {
		displayedScore += Math.ceil((score - displayedScore) / 10);
		scoreDisplay.innerText = displayedScore;
	}
	
	if (score >= nextLifeThreshold) {
		lives++;
		updateLivesUI();
		floatingTexts.push(new FloatingText(player.x + player.w/2, player.y - 40, "+1 VITA", "#2ecc71"));
		nextLifeThreshold += 1000;
	}
	
	if (keys['ArrowLeft']) player.vx = -SPEED;
	else if (keys['ArrowRight']) player.vx = SPEED;
	else player.vx = 0;
	
	player.update();
	if(insect) insect.update();
	
	floatingTexts.forEach((ft, i) => {
		ft.update();
		if (ft.life <= 0) floatingTexts.splice(i, 1);
	});
	
	particles.forEach((p, i) => {
		p.x += p.vx;
		p.y += p.vy;
		p.life -= 0.02;
		if (p.life <= 0) particles.splice(i, 1);
	});
	
	player.grounded = false;
	platforms.forEach(p => {
		if (player.vy > 0 && 
			player.x + player.w > p.x && 
			player.x < p.x + p.w &&
			player.y + player.h > p.y &&
			player.y + player.h < p.y + p.h + 10) {
			player.y = p.y - player.h;
			player.vy = 0;
			player.grounded = true;
			player.jumpCount = 0;
		}
	});
	
	if (insect && insect.active) {
		let dx = (player.x + player.w/2) - (insect.x + insect.w/2);
		let dy = (player.y + player.h/2) - (insect.y + insect.h/2);
		if (Math.sqrt(dx*dx + dy*dy) < 25) {
			insect.active = false;
			powerUpActive = true;
			score += 100;
			floatingTexts.push(new FloatingText(insect.x + insect.w/2, insect.y, "+100"));
		}
	}
	
	if (player.x + player.w > door.x && player.x < door.x + door.w &&
		player.y + player.h > door.y && player.y < door.y + door.h) {
		score += 200;
		floatingTexts.push(new FloatingText(door.x + door.w/2, door.y, "+200", "#00ffff"));
		level++;
		initLevel();
	}
	
	if (sonarActive && stamina > 0) {
		stamina -= 1.8;
		if (Math.random() > 0.85) {
			const range = powerUpActive ? 1800 : 300;
			sonarWaves.push({ x: player.x + player.w/2, y: player.y + player.h/2, r: 0, maxR: range });
			drones.forEach(d => {
				if (d.state === 'PATROL') {
					d.state = 'INVESTIGATING';
					d.targetX = player.x;
					d.targetY = player.y;
                    } else if (d.state === 'INVESTIGATING') {
					d.targetX = player.x;
					d.targetY = player.y;
				}
			});
		}
        } else {
		if (stamina < 100) stamina += 0.4;
	}
	staminaBar.style.width = stamina + '%';
	
	sonarWaves.forEach((w, i) => {
		w.r += powerUpActive ? 12 : 7;
		if (w.r > w.maxR) sonarWaves.splice(i, 1);
	});
	
	drones.forEach(d => {
		d.update();
		let dx = (player.x + player.w/2) - (d.x + d.w/2);
		let dy = (player.y + player.h/2) - (d.y + d.h/2);
		if (player.invulnerableTimer <= 0 && Math.sqrt(dx*dx + dy*dy) < 22) {
			loseLife();
		}
	});
}

function draw() {
	ctx.fillStyle = COLORS.bg;
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	
	const getVisibility = (x, y) => {
		if (gameState === 'START' || gameState === 'GAMEOVER') return 1.0;
		let distP = Math.sqrt(Math.pow((player.x + player.w/2) - x, 2) + Math.pow((player.y + player.h/2) - y, 2));
		if (distP < 70) return 1.0;
		let distD = Math.sqrt(Math.pow((door.x + door.w/2) - x, 2) + Math.pow((door.y + door.h/2) - y, 2));
		if (distD < 90) return 0.8;
		let maxVis = 0;
		sonarWaves.forEach(w => {
			let dist = Math.sqrt(Math.pow(w.x - x, 2) + Math.pow(w.y - y, 2));
			if (Math.abs(dist - w.r) < (powerUpActive ? 60 : 30)) {
				maxVis = Math.max(maxVis, 1 - (w.r / w.maxR));
			}
		});
		return maxVis;
	};
	
	caveBackground.forEach(rock => {
		let vis = getVisibility(rock.x, rock.y);
		if (vis > 0.1) {
			ctx.fillStyle = rock.color;
			ctx.globalAlpha = vis * 0.5;
			ctx.fillRect(rock.x, rock.y, rock.size, rock.size);
			ctx.globalAlpha = 1.0;
		}
	});
	
	if (gameState !== 'START' && gameState !== 'GAMEOVER') {
		platforms.forEach(p => {
			let vis = getVisibility(p.x + p.w/2, p.y + p.h/2);
			if (vis > 0.05) p.draw(ctx, vis);
		});
		
		let dVis = getVisibility(door.x + door.w/2, door.y + door.h/2);
		ctx.fillStyle = `rgba(241, 196, 15, ${Math.max(0.2, dVis)})`;
		ctx.fillRect(door.x, door.y, door.w, door.h);
		
		if(insect && insect.active) {
			let iVis = getVisibility(insect.x + insect.w/2, insect.y + insect.h/2);
			insect.draw(ctx, iVis);
		}
		
		drones.forEach(d => {
			let v = getVisibility(d.x + d.w/2, d.y + d.h/2);
			d.draw(ctx, v > 0.2);
		});
	}
	
	particles.forEach(p => {
		ctx.fillStyle = `rgba(255, 255, 255, ${p.life})`;
		ctx.fillRect(p.x, p.y, 2, 2);
	});
	
	player.draw(ctx);
	floatingTexts.forEach(ft => ft.draw(ctx));
	
	ctx.save();
	sonarWaves.forEach(w => {
		ctx.beginPath();
		ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2);
		const waveColor = powerUpActive ? '255, 255, 255' : '0, 255, 255';
		ctx.strokeStyle = `rgba(${waveColor}, ${0.5 * (1 - (w.r / w.maxR))})`;
		ctx.lineWidth = powerUpActive ? 6 : 3;
		ctx.stroke();
	});
	ctx.restore();
	
	let grad = ctx.createRadialGradient(
		player.x + player.w/2, player.y + player.h/2, 30,
		player.x + player.w/2, player.y + player.h/2, 350
	);
	grad.addColorStop(0, 'rgba(0,0,0,0)');
	grad.addColorStop(1, 'rgba(0,0,0,0.9)');
	ctx.fillStyle = grad;
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function gameLoop() {
	update();
	draw();
	requestAnimationFrame(gameLoop);
}

function setupTouchControls() {
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnJump = document.getElementById('btn-jump');
    const btnSonar = document.getElementById('btn-sonar');
	
    // Sinistra
    btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); keys['ArrowLeft'] = true; });
    btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); keys['ArrowLeft'] = false; });
	
    // Destra
    btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); keys['ArrowRight'] = true; });
    btnRight.addEventListener('touchend', (e) => { e.preventDefault(); keys['ArrowRight'] = false; });
	
    // Salto
    btnJump.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState === 'PLAYING' && player.jumpCount < 3) {
            player.vy = JUMP_FORCE;
            player.jumpCount++;
            player.grounded = false;
		}
	});
	
    // Sonar
    btnSonar.addEventListener('touchstart', (e) => { e.preventDefault(); sonarActive = true; });
    btnSonar.addEventListener('touchend', (e) => { e.preventDefault(); sonarActive = false; });
}

// Chiamala subito
setupTouchControls();

startBtn.addEventListener('click', () => {
	level = 1;
	lives = 3;
	score = 0;
	displayedScore = 0;
	nextLifeThreshold = 1000;
	scoreDisplay.innerText = "0";
	overlay.style.display = 'none';
	initLevel();
});

gameLoop();