import { Injectable } from '@angular/core';

declare var confetti: any;

@Injectable({
  providedIn: 'root',
})
export class ConfettiService {
  popConfetti() {
    // Left side confetti
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { x: 0, y: 0.6 },
    });

    // Right side confetti
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { x: 1, y: 0.6 },
    });
  }
}