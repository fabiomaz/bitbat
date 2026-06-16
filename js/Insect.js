class Insect {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.w = 16;
		this.h = 12;
		this.frame = 0;
		this.active = true;
	}
	update() {
		this.frame += 0.2;
	}
	draw(ctx, opacity) {
		if (!this.active || opacity < 0.2) return;
		ctx.save();
		ctx.globalAlpha = opacity;
		ctx.translate(this.x + this.w/2, this.y + this.h/2 + Math.sin(this.frame) * 5);
		
		const wingW = Math.abs(Math.cos(this.frame * 2)) * 8;
		ctx.fillStyle = '#fff';
		ctx.fillRect(-wingW - 2, -4, wingW, 8);
		ctx.fillRect(2, -4, wingW, 8);
		
		ctx.fillStyle = COLORS.insect;
		ctx.fillRect(-2, -3, 4, 6);
		
		ctx.restore();
	}
}