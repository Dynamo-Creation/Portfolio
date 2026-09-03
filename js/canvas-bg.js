/**
 * ==============================================================================
 * 🌌 3D INTERACTIVE PARTICLE & CONSTELLATION CANVAS ENGINE
 * ==============================================================================
 */

class Interactive3DCanvas {
  constructor(canvasId = 'bg-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      radius: 180,
      isHovered: false
    };

    this.settings = {
      count: 75,
      speed: 0.7,
      maxDistance: 150,
      depthScale: 600,
      primaryColor: '#6366f1',
      accentColor: '#06b6d4'
    };

    this.animationFrameId = null;
    this.isPaused = false;
    this.init();
  }

  init() {
    this.updateColors();
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  updateColors() {
    const computed = getComputedStyle(document.documentElement);
    this.settings.primaryColor = computed.getPropertyValue('--color-primary').trim() || '#6366f1';
    this.settings.accentColor = computed.getPropertyValue('--color-accent').trim() || '#06b6d4';
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(this.dpr, this.dpr);

    // Dynamic count based on screen width
    if (this.width < 768) {
      this.settings.count = 40;
      this.settings.maxDistance = 110;
    } else {
      this.settings.count = 80;
      this.settings.maxDistance = 150;
    }
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.settings.count; i++) {
      this.particles.push({
        x: (Math.random() - 0.5) * this.width * 1.5,
        y: (Math.random() - 0.5) * this.height * 1.5,
        z: Math.random() * this.settings.depthScale + 100,
        baseX: (Math.random() - 0.5) * this.width * 1.5,
        baseY: (Math.random() - 0.5) * this.height * 1.5,
        vx: (Math.random() - 0.5) * this.settings.speed,
        vy: (Math.random() - 0.5) * this.settings.speed,
        vz: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.2 + 1.2,
        colorType: Math.random() > 0.4 ? 'primary' : 'accent',
        opacity: Math.random() * 0.7 + 0.3,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        pulseAngle: Math.random() * Math.PI * 2
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = e.clientX;
      this.mouse.targetY = e.clientY;
      this.mouse.isHovered = true;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.isHovered = false;
      this.mouse.targetX = -1000;
      this.mouse.targetY = -1000;
    });

    // Touch support for mobile
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.targetX = e.touches[0].clientX;
        this.mouse.targetY = e.touches[0].clientY;
        this.mouse.isHovered = true;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.mouse.isHovered = false;
    });

    // Burst ripple on click
    window.addEventListener('click', (e) => {
      this.burst(e.clientX, e.clientY);
    });

    // Pause rendering when tab is hidden to save battery/resources
    document.addEventListener('visibilitychange', () => {
      this.isPaused = document.hidden;
      if (!this.isPaused) {
        this.animate();
      }
    });

    // Listen to theme changes
    window.addEventListener('themeChanged', () => {
      this.updateColors();
    });
  }

  burst(clickX, clickY) {
    const originX = clickX - this.width / 2;
    const originY = clickY - this.height / 2;

    this.particles.forEach(p => {
      const dx = p.x - originX;
      const dy = p.y - originY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 250 && dist > 0) {
        const force = (250 - dist) / 250;
        p.vx += (dx / dist) * force * 4;
        p.vy += (dy / dist) * force * 4;
      }
    });
  }

  animate() {
    if (this.isPaused) return;

    // Smooth mouse lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;

    this.ctx.clearRect(0, 0, this.width, this.height);

    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const mouseOffsetX = this.mouse.isHovered ? (this.mouse.x - centerX) * 0.04 : 0;
    const mouseOffsetY = this.mouse.isHovered ? (this.mouse.y - centerY) * 0.04 : 0;

    // 1. Update and Project 3D particles to 2D
    const projected = [];

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Physics move
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;

      // Pulse alpha
      p.pulseAngle += p.pulseSpeed;
      const currentAlpha = p.opacity * (0.6 + 0.4 * Math.sin(p.pulseAngle));

      // Boundary wraps
      const halfW = this.width * 0.8;
      const halfH = this.height * 0.8;
      if (p.x < -halfW) p.x = halfW;
      if (p.x > halfW) p.x = -halfW;
      if (p.y < -halfH) p.y = halfH;
      if (p.y > halfH) p.y = -halfH;
      if (p.z < 80) p.z = this.settings.depthScale;
      if (p.z > this.settings.depthScale) p.z = 80;

      // Friction
      p.vx *= 0.985;
      p.vy *= 0.985;
      if (Math.abs(p.vx) < 0.1) p.vx += (Math.random() - 0.5) * 0.1;
      if (Math.abs(p.vy) < 0.1) p.vy += (Math.random() - 0.5) * 0.1;

      // 3D Perspective Projection
      const fov = 350;
      const scale = fov / (fov + p.z);
      const screenX = (p.x + mouseOffsetX * (p.z / 200)) * scale + centerX;
      const screenY = (p.y + mouseOffsetY * (p.z / 200)) * scale + centerY;
      const radius = p.size * scale * 1.5;

      // Mouse interactive repulsion
      if (this.mouse.isHovered) {
        const mdx = screenX - this.mouse.x;
        const mdy = screenY - this.mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < this.mouse.radius && mdist > 0) {
          const mForce = (this.mouse.radius - mdist) / this.mouse.radius;
          p.x += (mdx / mdist) * mForce * 1.8;
          p.y += (mdy / mdist) * mForce * 1.8;
        }
      }

      projected.push({
        screenX,
        screenY,
        scale,
        radius,
        colorType: p.colorType,
        alpha: currentAlpha,
        z: p.z
      });
    }

    // 2. Draw Constellation Connecting Lines
    for (let i = 0; i < projected.length; i++) {
      for (let j = i + 1; j < projected.length; j++) {
        const p1 = projected[i];
        const p2 = projected[j];

        const dx = p1.screenX - p2.screenX;
        const dy = p1.screenY - p2.screenY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.settings.maxDistance) {
          const lineAlpha = (1 - dist / this.settings.maxDistance) * 0.18 * ((p1.scale + p2.scale) / 2);
          this.ctx.beginPath();
          this.ctx.moveTo(p1.screenX, p1.screenY);
          this.ctx.lineTo(p2.screenX, p2.screenY);
          this.ctx.strokeStyle = `rgba(99, 102, 241, ${lineAlpha})`;
          this.ctx.lineWidth = 1 * ((p1.scale + p2.scale) / 2);
          this.ctx.stroke();
        }
      }

      // Connect to mouse if nearby
      if (this.mouse.isHovered) {
        const p = projected[i];
        const mdx = p.screenX - this.mouse.x;
        const mdy = p.screenY - this.mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < this.mouse.radius) {
          const mAlpha = (1 - mdist / this.mouse.radius) * 0.35;
          this.ctx.beginPath();
          this.ctx.moveTo(p.screenX, p.screenY);
          this.ctx.lineTo(this.mouse.x, this.mouse.y);
          this.ctx.strokeStyle = `rgba(6, 182, 212, ${mAlpha})`;
          this.ctx.lineWidth = 1.2;
          this.ctx.stroke();
        }
      }
    }

    // 3. Render Particle Nodes with 3D depth and glow
    for (let i = 0; i < projected.length; i++) {
      const p = projected[i];
      const color = p.colorType === 'primary' ? this.settings.primaryColor : this.settings.accentColor;

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;

      // Glow effect for foreground particles
      if (p.z < 250) {
        this.ctx.shadowBlur = 10 * p.scale;
        this.ctx.shadowColor = color;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.screenX, p.screenY, Math.max(1, p.radius), 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.restore();
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.portfolioCanvas = new Interactive3DCanvas('bg-canvas');
});
