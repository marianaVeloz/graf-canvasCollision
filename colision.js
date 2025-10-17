const canvas = document.getElementById("colision");
let ctx = canvas.getContext("2d");

// Crear o usar el contador de eliminados
let removedCountDisplay = document.getElementById("removed-count");
if (!removedCountDisplay) {
    removedCountDisplay = document.createElement("div");
    removedCountDisplay.id = "removed-count";
    removedCountDisplay.style.position = "fixed";
    removedCountDisplay.style.top = "10px";
    removedCountDisplay.style.right = "20px";
    removedCountDisplay.style.font = "bold 20px Arial";
    removedCountDisplay.style.color = "#333";
    document.body.appendChild(removedCountDisplay);
}

let removedCounter = 0;
const NUM_OBJECTS = 20;

// Canvas responsive
let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

function setCanvasSize() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.background = "#989bd5ff";
}

setCanvasSize();
window.addEventListener("resize", setCanvasSize);

// CLASE FIGURA (hexágono relleno)
class Hexagon {
    constructor(x, y, radius, color, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.dy = this.speed;
        this.sides = 6; // Número de lados del hexágono
        this.rotation = Math.random() * Math.PI * 2;
    }

    draw(context) {
        const step = (Math.PI * 2) / this.sides;
        context.save();
        context.beginPath();
        context.translate(this.posX, this.posY);
        context.rotate(this.rotation);
        context.moveTo(this.radius * Math.cos(0), this.radius * Math.sin(0));

        for (let i = 1; i <= this.sides; i++) {
            const x = this.radius * Math.cos(i * step);
            const y = this.radius * Math.sin(i * step);
            context.lineTo(x, y);
        }

        context.closePath();
        context.fillStyle = this.color;
        context.shadowColor = this.color;
        context.shadowBlur = 15;
        context.fill();
        context.restore();
    }

    update(context) {
        this.posY += this.dy;
        this.rotation += 0.01; // Rotación ligera para dinamismo

        // Si llega al fondo, reaparece arriba
        if (this.posY - this.radius > canvasHeight) {
            this.posY = -this.radius;
            this.posX = Math.random() * (canvasWidth - this.radius * 2) + this.radius;
        }

        this.draw(context);
    }
}

// UTILIDADES

function getRandomColor() {
    const colors = [
        "#ff1818ff", "#7e670bff", "#138122ff",
        "#1554acff", "#85071aff", "#c02a05ff",
        "#38146dff", "#33766dff"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Efecto de sonido “pop”
function playPopSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.15);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.15);
}


// INTERACCIÓN DE CLIC

canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    for (let i = 0; i < objects.length; i++) {
        const o = objects[i];
        const dx = mouseX - o.posX;
        const dy = mouseY - o.posY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Si se clicó sobre la figura
        if (distance <= o.radius) {
            removedCounter++;
            playPopSound();

            // Crear nueva figura para reemplazarla (no reduce el total)
            const radius = Math.random() * 20 + 15;
            const x = Math.random() * (canvasWidth - radius * 2) + radius;
            const y = -radius;
            const color = getRandomColor();
            const speed = Math.random() * 2 + 1;
            objects[i] = new Hexagon(x, y, radius, color, speed);

            break;
        }
    }

    removedCountDisplay.textContent = `Eliminados: ${removedCounter}`;
  }
);


// GENERACIÓN Y LOOP

let objects = [];

function generateObjects(n) {
    objects = [];
    for (let i = 0; i < n; i++) {
        const radius = Math.random() * 20 + 15;
        const x = Math.random() * (canvasWidth - radius * 2) + radius;
        const y = -Math.random() * 200 - radius;
        const color = getRandomColor();
        const speed = Math.random() * 2 + 1;
        objects.push(new Hexagon(x, y, radius, color, speed));
    }
}

function animate() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    objects.forEach(obj => obj.update(ctx));
    requestAnimationFrame(animate);
}


// EJECUCIÓN

generateObjects(NUM_OBJECTS);
removedCountDisplay.textContent = "Eliminados: 0";
animate();