class Drone {
	constructor(x, y) {
		this.w = 32;
		this.h = 32;
		this.path = [];
		this.generatePath(x, y);
		this.currentPointIndex = 0;
		
		this.x = this.path[0].x;
		this.y = this.path[0].y;
		
		this.speed = 1.5 + (level * 0.2);
		this.state = 'PATROL'; 
		this.targetX = null;
		this.targetY = null;
		this.timer = Math.random() * 180;
		this.wingFrame = Math.random() * 10;
		this.lightOn = false;
		this.alertTimer = 0;
	}
	
	generatePath(startX, startY) {
		const numPoints = 3 + Math.floor(Math.random() * 3);
		const radiusX = 100 + Math.random() * 80;
		const radiusY = 60 + Math.random() * 60;
		
		for(let i = 0; i < numPoints; i++) {
			const angle = (i / numPoints) * Math.PI * 2;
			let px = startX + Math.cos(angle) * radiusX;
			let py = startY + Math.sin(angle) * radiusY;
			px = Math.max(20, Math.min(WIDTH - 40, px));
			py = Math.max(100, Math.min(HEIGHT - 50, py));
			this.path.push({x: px, y: py});
		}
	}
	
	update() {
		this.timer++;
		this.wingFrame += 0.2;
		
		if (this.state === 'PATROL') {
			this.lightOn = (this.timer % 180 < 60);
			
			const target = this.path[this.currentPointIndex];
			const dx = target.x - this.x;
			const dy = target.y - this.y;
			const dist = Math.sqrt(dx*dx + dy*dy);
			
			if (dist < 5) {
				this.currentPointIndex = (this.currentPointIndex + 1) % this.path.length;
                } else {
				this.x += (dx / dist) * this.speed;
				this.y += (dy / dist) * this.speed;
			}
			
            } else if (this.state === 'INVESTIGATING') {
			this.lightOn = true;
			const dx = this.targetX - this.x;
			const dy = this.targetY - this.y;
			const dist = Math.sqrt(dx*dx + dy*dy);
			
			if (dist > 5) {
				this.x += (dx / dist) * (this.speed * 2.2); 
				this.y += (dy / dist) * (this.speed * 2.2);
				this.wingFrame += 0.15;
                } else {
				this.alertTimer++;
				if (this.alertTimer > 100) {
					this.state = 'RETURNING';
					this.alertTimer = 0;
				}
			}
			
            } else if (this.state === 'RETURNING') {
			this.lightOn = (this.timer % 180 < 60);
			const target = this.path[this.currentPointIndex];
			const dx = target.x - this.x;
			const dy = target.y - this.y;
			const dist = Math.sqrt(dx*dx + dy*dy);
			
			if (dist < 5) {
				this.state = 'PATROL';
                } else {
				this.x += (dx / dist) * this.speed;
				this.y += (dy / dist) * this.speed;
			}
		}
	}
	
	draw(ctx, isVisible) {
		if (!this.lightOn && !isVisible) return;
		
		ctx.save();
		ctx.translate(this.x + this.w/2, this.y + this.h/2);
		
		const px = 4;
		const wingY = Math.sin(this.wingFrame) * 10;
		
		ctx.fillStyle = COLORS.owlBody;
		ctx.fillRect(-this.w/2 - px, -px + wingY, px*3, px*2);
		ctx.fillRect(this.w/2 - px*2, -px + wingY, px*3, px*2);
		
		ctx.fillStyle = COLORS.owlBody;
		ctx.fillRect(-this.w/4, -this.h/2 + px, this.w/2, this.h - px*2);
		
		ctx.fillStyle = COLORS.owlFace;
		ctx.beginPath();
		ctx.arc(-px, -px*2, px*2, 0, Math.PI * 2);
		ctx.arc(px, -px*2, px*2, 0, Math.PI * 2);
		ctx.fill();
		
		const isAlert = (this.state === 'INVESTIGATING');
		ctx.fillStyle = isAlert ? COLORS.owlEyeAlert : '#333';
		ctx.fillRect(-px - 1, -px*2 - 1, 2, 2);
		ctx.fillRect(px - 1, -px*2 - 1, 2, 2);
		
		ctx.fillStyle = COLORS.owlBeak;
		ctx.fillRect(-1, -px + 1, 2, 3);
		
		ctx.restore();
	}
}