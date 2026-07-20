import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: 'circle' | 'rect' | 'triangle';
}

export default function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const colors = [
      '#FFC107', // Amber
      '#FF5722', // Coral Orange
      '#E91E63', // Vivid Pink
      '#9C27B0', // Purple
      '#3F51B5', // Indigo Blue
      '#00BCD4', // Cyan
      '#4CAF50', // Lime Green
      '#0066FF', // Brand Blue
      '#10B981', // Emerald
      '#EF4444', // Red
    ];

    const particles: Particle[] = [];
    const shapes: ('circle' | 'rect' | 'triangle')[] = ['circle', 'rect', 'triangle'];

    // Initial central burst
    const initialBurstCount = 140;
    for (let i = 0; i < initialBurstCount; i++) {
      particles.push({
        x: width / 2,
        y: height / 2 - 40,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 14,
        speedY: (Math.random() - 0.75) * 16 - 4, // Upwards shoot
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        opacity: 1,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    // Side-cannon celebratory blasts
    const addSideBlast = (startX: number, direction: 1 | -1) => {
      const blastCount = 45;
      for (let i = 0; i < blastCount; i++) {
        particles.push({
          x: startX,
          y: height - 20,
          size: Math.random() * 8 + 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: direction * (Math.random() * 10 + 6),
          speedY: -(Math.random() * 14 + 12),
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          opacity: 1,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
        });
      }
    };

    // Trigger double side cannons immediately
    addSideBlast(10, 1);
    addSideBlast(width - 10, -1);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Apply velocities
        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += 0.24; // gravity pulling down
        p.speedX *= 0.985; // drag/air resistance
        p.rotation += p.rotationSpeed;

        // Fade out as they fall near or below the screen height
        if (p.y > height - 120) {
          p.opacity -= 0.015;
        }

        if (p.opacity <= 0 || p.x < -50 || p.x > width + 50) {
          particles.splice(i, 1);
          continue;
        }

        // Draw individual particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 2);
        } else if (p.shape === 'triangle') {
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size, p.size);
          ctx.lineTo(-p.size, p.size);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999] w-full h-full"
      style={{ mixBlendMode: 'normal' }}
    />
  );
}
