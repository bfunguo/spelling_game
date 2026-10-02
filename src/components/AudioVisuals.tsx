import confetti from 'canvas-confetti';

export function fireVictoryConfetti() {
  if (typeof window === 'undefined') return;

  // First burst: colorful paper & gold coins
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { y: 0.65 },
    colors: ['#FBBF24', '#EF4444', '#22C55E', '#38BDF8', '#F59E0B'],
    shapes: ['circle', 'square'],
  });

  // Second delayed burst from sides
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.7 },
      colors: ['#FDE047', '#EAB308', '#60A5FA'],
    });
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.7 },
      colors: ['#FDE047', '#EAB308', '#4ADE80'],
    });
  }, 180);
}

export function fireStarPowerConfetti() {
  if (typeof window === 'undefined') return;

  const duration = 2 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#FDE047', '#F59E0B', '#F43F5E'],
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#FDE047', '#F59E0B', '#38BDF8'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
