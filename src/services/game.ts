import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";

@Injectable({
    providedIn: 'root',
})
export class GameService {
    private currentQuestionSource = new BehaviorSubject<number>(1);
    currentQuestion = this.currentQuestionSource.asObservable();

    private guessesSource = new BehaviorSubject<number>(3);
    guesses = this.guessesSource.asObservable();

    private usedTracksSource = new BehaviorSubject<string[]>([]);
    usedTracks = this.usedTracksSource.asObservable();

    private gameConfiguration: any = {
        selectedGenre: undefined,
        numberOfTracks: 1,
        numberOfArtists: 2,
        difficulty: 'easy'
    };

    setGameConfiguration(state: any) {
        this.gameConfiguration = state;
    }

    resetGameConfiguration(state: any) {
        this.gameConfiguration = {
            selectedGenre: undefined,
            numberOfTracks: 1,
            numberOfArtists: 2
        }
    }

    getGameConfiguration() {
        return this.gameConfiguration;
    }

    updateCurrentQuestion(question: number) {
        this.currentQuestionSource.next(question);
    }

    updateGuesses(guesses: number) {
        this.guessesSource.next(guesses);
    }

    updateUsedTracks(tracks: string[]) {
        this.usedTracksSource.next(tracks);
    }
}