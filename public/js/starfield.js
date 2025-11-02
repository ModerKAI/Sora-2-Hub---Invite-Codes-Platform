// Simple Starfield Background - No dependencies
console.log('⭐ Starfield starting...');

// Create canvas
const canvas = document.createElement('canvas');
canvas.id = 'starfield-canvas';
canvas.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: #0A0A1A;
  pointer-events: none;
`;
document.body.insertBefore(canvas, document.body.firstChild);

const ctx = canvas.getContext('2d');
let w, h, stars = [];

// Resize canvas
function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  console.log(`📐 Canvas resized: ${w}x${h}`);
}

// Star class
class Star {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.z = Math.random() * 1000;
    this.size = Math.random() * 2 + 1;
    this.brightness = Math.random();
    this.twinkleSpeed = Math.random() * 0.02 + 0.01;
    this.hue = 190 + Math.random() * 40; // Blue-cyan
  }
  
  update() {
    // Move towards viewer
    this.z -= 2;
    
    if (this.z <= 0) {
      this.reset();
      this.z = 1000;
    }
    
    // Twinkle effect
    this.brightness += this.twinkleSpeed;
  }
  
  draw() {
    const x = (this.x - w / 2) * (1000 / this.z) + w / 2;
    const y = (this.y - h / 2) * (1000 / this.z) + h / 2;
    
    // Skip if off screen
    if (x < 0 || x > w || y < 0 || y > h) {return;}
    
    const size = this.size * (1000 / this.z);
    const alpha = Math.sin(this.brightness) * 0.5 + 0.5;
    
    // Draw star
    ctx.save();
    ctx.translate(x, y);
    
    // Glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = `hsla(${this.hue}, 70%, 70%, ${alpha * 0.8})`;
    
    // Star shape
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const radius = i % 2 === 0 ? size * 2 : size;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    
    ctx.fillStyle = `hsla(${this.hue}, 80%, 90%, ${alpha})`;
    ctx.fill();
    
    // Bright center
    if (size > 1) {
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    }
    
    ctx.restore();
  }
}

// Create stars
function init() {
  resize();
  stars = [];
  const count = Math.min(200, Math.floor((w * h) / 8000));
  
  for (let i = 0; i < count; i++) {
    stars.push(new Star());
  }
  
  console.log(`✨ Created ${count} stars`);
}

// Animation loop
function animate() {
  // Clear previous frame completely (no trails)
  ctx.fillStyle = '#0A0A1A';
  ctx.fillRect(0, 0, w, h);
  
  stars.forEach(star => {
    star.update();
    star.draw();
  });
  
  requestAnimationFrame(animate);
}

// Start
window.addEventListener('resize', resize);
init();
animate();

console.log('✅ Starfield initialized!');

