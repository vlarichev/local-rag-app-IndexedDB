'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

type Particle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
};

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 50;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.1
    });

    const initParticles = () => {
      particles = Array.from({ length: particleCount }, createParticle);
    };

    const drawParticle = (particle: Particle) => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      const color = theme === 'dark' ? '255, 255, 255' : '128, 90, 213';
      ctx.fillStyle = `rgba(${color}, ${particle.opacity})`;
      ctx.fill();
    };

    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            const opacity = (1 - distance / 150) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const color = theme === 'dark' ? '255, 255, 255' : '128, 90, 213';
            ctx.strokeStyle = `rgba(${color}, ${opacity})`;
            ctx.stroke();
          }
        }
      }
    };

    const updateParticles = () => {
      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      updateParticles();
      particles.forEach(drawParticle);
      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      resizeCanvas();
      initParticles();
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
    />
  );
}
