
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Potential Issue Note: If you're seeing "Uncaught SyntaxError: Unexpected token ';'",
// ensure that your environment is correctly transpiling TSX/JSX to JavaScript.
// Browsers don't natively understand TSX, and this can lead to parsing errors.
// The reported semicolon might be a secondary effect of the parser encountering TS/JSX.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Canvas Starfield Logic
const canvas = document.getElementById('starfield-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

if (!canvas || !ctx) {
  console.error("Starfield canvas not found or context could not be created.");
} else {
  interface Star {
    x: number;
    y: number;
    z: number; // Depth factor (0.1 near, 1.0 far - for inverse size relationship)
    radius: number;
    opacity: number; // Static opacity
    speed: number; // Individual speed for each star
  }

  let stars: Star[] = [];
  
  // Configuration
  const STAR_COLOR = 'rgb(255, 255, 255)'; 
  const STAR_DENSITY_FACTOR = 0.00035; 
  const MAX_STARS_CAP = 800; 
  const MIN_DISTANCE_BETWEEN_STARS = 15; 
  const MAX_ATTEMPTS_PER_STAR = 50; 

  const STAR_MIN_SPEED = 0.09; 
  const STAR_MAX_SPEED = 0.18; 

  const STAR_MIN_RADIUS = 0.3;
  const STAR_MAX_RADIUS = 1.8;
  
  const STAR_MIN_OPACITY = 0.2;
  const STAR_MAX_OPACITY = 0.9;

  let isUserScrolling = false;
  let scrollTimeoutId: number | undefined;
  let animationFrameId: number;
  let frameCounter = 0;
  const SCROLL_ANIMATION_THROTTLE_FACTOR = 2; // Update starfield every Nth frame during scroll

  function setCanvasDimensions() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initStars() {
    setCanvasDimensions();
    stars = [];
    const numStarsTarget = Math.min(MAX_STARS_CAP, Math.floor(canvas.width * canvas.height * STAR_DENSITY_FACTOR));

    for (let i = 0; i < numStarsTarget; i++) {
      let attempts = 0;
      let placed = false;
      while (attempts < MAX_ATTEMPTS_PER_STAR && !placed) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        let tooClose = false;
        for (const star of stars) {
          const dx = x - star.x;
          const dy = y - star.y;
          const distanceSquared = dx * dx + dy * dy;
          if (distanceSquared < MIN_DISTANCE_BETWEEN_STARS * MIN_DISTANCE_BETWEEN_STARS) {
            tooClose = true;
            break;
          }
        }

        if (!tooClose) {
          const z = Math.random() * 0.9 + 0.1; 
          const speed = Math.random() * (STAR_MAX_SPEED - STAR_MIN_SPEED) + STAR_MIN_SPEED;
          stars.push({
            x,
            y,
            z,
            radius: STAR_MIN_RADIUS + (1 - z) * (STAR_MAX_RADIUS - STAR_MIN_RADIUS), 
            opacity: Math.random() * (STAR_MAX_OPACITY - STAR_MIN_OPACITY) + STAR_MIN_OPACITY,
            speed,
          });
          placed = true;
        }
        attempts++;
      }
    }
  }

  function updateStars() {
    if (!ctx) return;
    for (const star of stars) {
      star.x -= star.speed; // Move star left based on its individual speed

      // Wrap star to the right edge if it moves off the left edge
      if (star.x < -star.radius) { 
        star.x = canvas.width + star.radius; 
        star.y = Math.random() * canvas.height; // Re-randomize y position
        
        // Optionally re-randomize other properties for more dynamic appearance over time
        star.z = Math.random() * 0.9 + 0.1;
        star.radius = STAR_MIN_RADIUS + (1 - star.z) * (STAR_MAX_RADIUS - STAR_MIN_RADIUS);
        star.opacity = Math.random() * (STAR_MAX_OPACITY - STAR_MIN_OPACITY) + STAR_MIN_OPACITY;
        star.speed = Math.random() * (STAR_MAX_SPEED - STAR_MIN_SPEED) + STAR_MIN_SPEED;
      }
    }
  }

  function drawStars() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = STAR_COLOR; 

    for (const star of stars) {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.globalAlpha = star.opacity; 
      ctx.fill();
    }
    ctx.globalAlpha = 1.0; 
  }

  function animate() {
    frameCounter++;
    if (isUserScrolling) {
      if (frameCounter % SCROLL_ANIMATION_THROTTLE_FACTOR === 0) {
        updateStars();
        drawStars();
      }
    } else {
      updateStars();
      drawStars();
    }
    animationFrameId = requestAnimationFrame(animate);
  }

  function handleResize() {
    if (animationFrameId) { 
        cancelAnimationFrame(animationFrameId);
    }
    setCanvasDimensions();
    initStars(); 
    animate(); 
  }

  function handleScroll() {
    isUserScrolling = true;
    if (scrollTimeoutId !== undefined) {
      clearTimeout(scrollTimeoutId);
    }
    scrollTimeoutId = window.setTimeout(() => {
      isUserScrolling = false;
    }, 150); // User is considered to have stopped scrolling after 150ms of no scroll events
  }

  // Initialize
  initStars();
  animate();
  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleScroll, { passive: true });
}
