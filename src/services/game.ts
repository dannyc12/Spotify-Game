import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";

@Injectable({
    providedIn: 'root',
})
export class GameService {
    private currentQuestionSource = new BehaviorSubject<number>(1);
    currentQuestion = this.currentQuestionSource.asObservable();

    private guessesSource = new BehaviorSubject<number>(4);
    guesses = this.guessesSource.asObservable();

    updateCurrentQuestion(question: number) {
        this.currentQuestionSource.next(question);
    }

    updateGuesses(guesses: number) {
        this.guessesSource.next(guesses);
    }

}