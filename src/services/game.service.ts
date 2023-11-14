import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameState: any = {
    selectedGenre: undefined,
    numberOfTracks: 1,
    numberOfArtists: 2
  };

  setGameState(state: any) {
    this.gameState = state;
  }

  resetGameState(state: any) {
    this.gameState = {
      selectedGenre: undefined,
      numberOfTracks: 1,
      numberOfArtists: 2
    }
  }

  getGameState() {
    return this.gameState;
  }

  constructor() { }
}
