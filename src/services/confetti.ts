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

  wrongConfetti() {
    confetti({
      particleCount: 1,
      spread: 0,
      origin: { x: 0.5, y: 0.5 },
      zIndex: 1000, // Ensure the text appears on top of other confetti
      disableForReducedMotion: true, // Disable confetti for users with reduced motion preferences
      beforeEnd: (confettiInstance: {
          addConfetti: (arg0: {
            particleCount: number; spread: number; origin: { x: number; y: number; }; zIndex: number; disableForReducedMotion: boolean; ticks: number; // Adjust the duration of the text confetti
            shapes: HTMLCanvasElement[];
          }) => void;
        }) => {
        // Customize the confetti shape and text
        const text = '-1';
        const textCanvas = document.createElement('canvas');
        const textContext = textCanvas.getContext('2d');
        textCanvas.width = 30; // Adjust the width of the canvas
        textCanvas.height = 30; // Adjust the height of the canvas
        if (textContext) {
          textContext.font = '20px Arial'; // Set the font and size
          textContext.fillStyle = '#FF0000'; // Set the text color
          textContext.fillText(text, 0, 20); // Adjust the text position
        }

        // Use the canvas as a texture for the confetti
        confettiInstance.addConfetti({
          particleCount: 1,
          spread: 360,
          origin: { x: 0.5, y: 0.5 },
          zIndex: 1000,
          disableForReducedMotion: true,
          ticks: 300, // Adjust the duration of the text confetti
          shapes: [textCanvas],
        });
      },
    });
  }
}