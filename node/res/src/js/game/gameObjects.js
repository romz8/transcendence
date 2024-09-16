export class Pad {
    constructor(width, height, x, y, speed) {
      this.width = width;
      this.height = height;
      this.x = x;
      this.y = y;
      this.speed = speed;
    }
    draw(ctx) {
      ctx.fillStyle = "white";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    };
}

export class Ball {

    constructor(x, y, radius, speedX, speedY) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.dx = speedX;
      this.dy = speedY;
      this.visible = true;
    }
  
    setInitialDirection = function (number) {
      
      switch (number) {
        case 1:
          this.dx = this.dx * -1;
          break;
        case 2:
          break;
        case 3:
          this.dy = this.dy * -1;
          break;
        case 4:
          this.dy = this.dy * -1;
          this.dx = this.dx * -1;
          break;
      }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.closePath();
      };
  }
