class FloatingText {
	constructor(x, y, text, color = '#f1c40f') {
		this.x = x;
		this.y = y;
		this.text = text;
		this.color = color;
		this.life = 1.0;
		this.vy = -1.5;
	}
	update() {
		this.y += this.vy;
		this.life -= 0.015;
	}
	draw(ctx) {
		ctx.save();
		ctx.globalAlpha = this.life;
		ctx.fillStyle = this.color;
		ctx.font = 'bold 20px "Courier New"';
		ctx.textAlign = 'center';
		ctx.fillText(this.text, this.x, this.y);
		ctx.restore();
	}
}