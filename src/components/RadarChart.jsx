import { useEffect, useRef } from 'react';

const LABELS = ['Proximity', 'Availability', 'Experience', 'Verification', 'Reliability', 'Budget Fit'];
const KEYS = ['proximity', 'availability', 'experience', 'verification', 'reliability', 'budgetFit'];

export default function RadarChart({ scores, size = 240 }) {
  const canvasRef = useRef(null);
  const center = size / 2;
  const maxR = size / 2 - 30;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const n = 6;
    const angleStep = (2 * Math.PI) / n;
    const startAngle = -Math.PI / 2;

    const getPoint = (i, r) => ({
      x: center + r * Math.cos(startAngle + i * angleStep),
      y: center + r * Math.sin(startAngle + i * angleStep),
    });

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Grid rings
    for (let ring = 1; ring <= 4; ring++) {
      const r = (maxR / 4) * ring;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const p = getPoint(i % n, r);
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Axes
    for (let i = 0; i < n; i++) {
      const p = getPoint(i, maxR);
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Data polygon
    const values = KEYS.map((k) => (scores[k] || 0) / 100);
    ctx.beginPath();
    values.forEach((v, i) => {
      const p = getPoint(i, v * maxR);
      i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(79, 70, 229, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Data points
    values.forEach((v, i) => {
      const p = getPoint(i, v * maxR);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#818CF8';
      ctx.fill();
      ctx.strokeStyle = '#4F46E5';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Labels
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = '#CBD5E1';
    ctx.textAlign = 'center';
    LABELS.forEach((label, i) => {
      const p = getPoint(i, maxR + 18);
      ctx.fillText(label, p.x, p.y + 4);
    });
  }, [center, maxR, scores, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: size, height: size }}
    />
  );
}
