import { Injectable } from '@angular/core';

declare var confetti: any;

@Injectable({
  providedIn: 'root',
})
export class ConfettiService {
  popConfetti() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }
}