const canvas = document.getElementById("colision");
let ctx = canvas.getContext("2d");

const window_height = window.innerHeight;
const window_width = window.innerWidth;
canvas.height = window_height;
canvas.width = window_width;
canvas.style.background = "rgba(106, 75, 130, 1)";

class Circle {
  constructor(x, y, radius, color, text, speed) {
    this.posX = x;
    this.posY = y;
    this.radius = radius;
    this.originalColor = color;
    this.color = color;
    this.text = text;
    this.speed = speed;
    this.dx = (Math.random() < 0.5 ? -1 : 1) * this.speed;
    this.dy = (Math.random() < 0.5 ? -1 : 1) * this.speed;
    this.isColliding = false; // Indica si está en colisión
  }

  draw(context) {
    context.beginPath();
    context.strokeStyle = this.color;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "20px Arial";
    context.fillText(this.text, this.posX, this.posY);
    context.lineWidth = 2;
    context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
    context.stroke();
    context.closePath();
  }

  update(context) {
    this.posX += this.dx;
    this.posY += this.dy;

    // Rebote en los bordes
    if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
      this.dx = -this.dx;
    }
    if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
      this.dy = -this.dy;
    }

    // Cambiar color si está en colisión
    this.color = this.isColliding ? "#0000FF" : this.originalColor;

    this.draw(context);

    // Resetear el estado para la próxima detección
    this.isColliding = false;
  }
}

let circles = [];

function generateCircles(n) {
  for (let i = 0; i < n; i++) {
    let radius = Math.random() * 30 + 20;
    let x = Math.random() * (window_width - radius * 2) + radius;
    let y = Math.random() * (window_height - radius * 2) + radius;
    let color = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    let speed = Math.random() * 4 + 1;
    let text = `C${i + 1}`; // Etiqueta del círculo
    circles.push(new Circle(x, y, radius, color, text, speed));
  }
}

// Detección de colisiones con rebote visible
function detectCollisions() {
  for (let i = 0; i < circles.length; i++) {
    for (let j = i + 1; j < circles.length; j++) {
      let c1 = circles[i];
      let c2 = circles[j];

      let dx = c2.posX - c1.posX;
      let dy = c2.posY - c1.posY;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < c1.radius + c2.radius) {
        // Marcar como colisionando
        c1.isColliding = true;
        c2.isColliding = true;

        // Calcular ángulo
        let angle = Math.atan2(dy, dx);

        // Separar ligeramente los círculos para evitar superposición
        let overlap = (c1.radius + c2.radius - distance) / 2;
        c1.posX -= Math.cos(angle) * overlap;
        c1.posY -= Math.sin(angle) * overlap;
        c2.posX += Math.cos(angle) * overlap;
        c2.posY += Math.sin(angle) * overlap;

        // Intercambiar velocidades
        let tempDx = c1.dx;
        let tempDy = c1.dy;
        c1.dx = c2.dx;
        c1.dy = c2.dy;
        c2.dx = tempDx;
        c2.dy = tempDy;
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, window_width, window_height);

  detectCollisions();

  circles.forEach((circle) => {
    circle.update(ctx);
  });

  requestAnimationFrame(animate);
}

generateCircles(20);
animate();