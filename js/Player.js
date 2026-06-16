class Player {
	constructor() {
		this.reset();
		this.invulnerableTimer = 0;
	}
	reset() {
		this.x = WIDTH / 2 - 15;
		this.y = HEIGHT - 120;
		this.w = 30; // Leggermente più grande per il menu
		this.h = 20;
		this.vx = 0;
		this.vy = 0;
		this.grounded = false;
		this.frame = 0;
		this.jumpCount = 0;
		this.tilt = 0;
		powerUpActive = false;
	}
	update() {
		if (gameState === 'START' || gameState === 'GAMEOVER') {
			this.frame += 0.15;
			// Fluttuazione nel menu
			this.y = HEIGHT - 150 + Math.sin(this.frame * 0.5) * 15;
			return;
		}
		
		this.vy += GRAVITY;
		this.x += this.vx;
		this.y += this.vy;
		this.tilt += (this.vx * 0.05 - this.tilt) * 0.1;
		
		if (this.x < 0) this.x = 0;
		if (this.x + this.w > WIDTH) this.x = WIDTH - this.w;
		if (this.y > HEIGHT) loseLife();
		if (this.invulnerableTimer > 0) this.invulnerableTimer--;
		
		if (powerUpActive && (Math.abs(this.vx) > 0 || Math.abs(this.vy) > 1)) {
			if (Math.random() > 0.7) {
				particles.push({
					x: this.x + Math.random() * this.w,
					y: this.y + Math.random() * this.h,
					life: 1.0,
					vx: (Math.random() - 0.5),
					vy: (Math.random() - 0.5)
				});
			}
		}
	}
	draw(ctx) {
		if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 100) % 2 === 0) {
			return;
		}
		
		ctx.save();
		this.frame += 0.15;
		let wingY = Math.sin(this.frame) * 10;
		
		// Aura nel menu
		if (gameState === 'START' || gameState === 'GAMEOVER') {
			ctx.beginPath();
			let auraGrad = ctx.createRadialGradient(this.x + this.w/2, this.y + this.h/2, 0, this.x + this.w/2, this.y + this.h/2, 60);
			auraGrad.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
			auraGrad.addColorStop(1, 'rgba(0, 255, 255, 0)');
			ctx.fillStyle = auraGrad;
			ctx.arc(this.x + this.w / 2, this.y + this.h / 2, 60, 0, Math.PI * 2);
			ctx.fill();
		}
		
		if (powerUpActive) {
			ctx.beginPath();
			const pulse = 45 + Math.sin(this.frame * 4) * 10;
			ctx.arc(this.x + this.w / 2, this.y + this.h / 2, pulse, 0, Math.PI * 2);
			ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(this.frame * 4) * 0.1})`;
			ctx.lineWidth = 2;
			ctx.setLineDash([5, 5]);
			ctx.stroke();
			ctx.setLineDash([]);
		}
		
		ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
		ctx.rotate(this.tilt);
		
		const px = 3; 
		
		// Ali
		ctx.fillStyle = COLORS.batWing;
		ctx.fillRect(-this.w/2 - px*2, -px + wingY, px*3, px*2);
		ctx.fillRect(-this.w/2 - px*4, -px*2 + wingY, px*3, px*2);
		ctx.fillRect(this.w/2 - px, -px + wingY, px*3, px*2);
		ctx.fillRect(this.w/2 + px, -px*2 + wingY, px*3, px*2);
		
		// Corpo
		ctx.fillStyle = COLORS.batBody;
		ctx.fillRect(-this.w/2 + px, -this.h/2 + px*2, this.w - px*2, this.h - px*2);
		
		// Orecchie
		ctx.fillRect(-this.w/2 + px*2, -this.h/2, px, px*2);
		ctx.fillRect(this.w/2 - px*3, -this.h/2, px, px*2);
		
		// Occhi
		if (powerUpActive) {
			ctx.fillStyle = (Math.floor(this.frame * 8) % 2 === 0) ? '#fff' : COLORS.batEye;
            } else {
			ctx.fillStyle = COLORS.batEye;
		}
		ctx.fillRect(-px*2, -px, px, px);
		ctx.fillRect(px, -px, px, px);
		
		ctx.restore();
	}
}