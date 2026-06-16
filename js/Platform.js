class Platform {
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}
	draw(ctx, opacity) {
		ctx.fillStyle = `rgba(44, 62, 80, ${opacity})`;
		ctx.fillRect(this.x, this.y, this.w, this.h);
		
		ctx.fillStyle = `rgba(52, 73, 94, ${opacity})`;
		ctx.fillRect(this.x, this.y, this.w, 4);
		
		ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.1})`;
		for(let i=0; i<this.w; i+=10) {
			if((i/10)%2===0) ctx.fillRect(this.x + i, this.y + 6, 4, 4);
		}
	}
}