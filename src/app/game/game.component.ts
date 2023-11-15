import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import fetchFromSpotify, { request } from "../../services/api";
import Track from '../models/track';
import Artist from '../models/artist';
import { Router } from '@angular/router';
import { GameService } from 'src/services/game';
import { ConfettiService } from 'src/services/confetti';

const AUTH_ENDPOINT =
  "https://nuod0t2zoe.execute-api.us-east-2.amazonaws.com/FT-Classroom/spotify-auth-token";
const TOKEN_KEY = "whos-who-access-token";

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  @ViewChild('overlay', { static: false }) overlay!: ElementRef;
  @ViewChild('popup', { static: false }) popup!: ElementRef;
  @ViewChild('message', { static: false }) message!: ElementRef;
  
  @ViewChild('wrong', { static: false }) wrongMessage!: ElementRef;
  @ViewChild('correct', { static: false }) correctMessage!: ElementRef;
  


  @Input() artistOptions: Artist[] = [];
  @Input() track: Track | undefined;
  @Input() guesses: number = 4;
  @Input() currentQuestion: number = 1;

  authLoading: boolean = false;
  gameLoading: boolean = false;
  correctArtistId: string = "";
  selectedArtistId: string = "";
  token: String = "";
  correct: boolean | undefined = undefined;
  totalArtistOptions: number = 3;
  totalQuestions: number = 3;
  genre: string = "rock"

  constructor(private gameData: GameService, private router: Router, private renderer: Renderer2, private confettiService: ConfettiService) { }

  ngOnInit(): void {
    if (!this.gameData.getGameConfiguration().genre) {
      this.router.navigateByUrl('/');
    } 

    this.gameData.currentQuestion.subscribe(currentQuestion => this.currentQuestion = currentQuestion);
    this.gameData.guesses.subscribe(guesses => this.guesses = guesses);
    this.genre = this.gameData.getGameConfiguration().genre;
    this.totalArtistOptions = this.gameData.getGameConfiguration().numberOfArtists;
    this.totalQuestions = this.gameData.getGameConfiguration().numberOfTracks;

    this.authLoading = true;
    const storedTokenString = localStorage.getItem(TOKEN_KEY);
    if (storedTokenString) {
      const storedToken = JSON.parse(storedTokenString);
      if (storedToken.expiration > Date.now()) {
        console.log("Token found in localstorage");
        this.authLoading = false;
        this.token = storedToken.value;
        this.getTrack(storedToken.value);
        return;
      }
    }
    console.log("Sending request to AWS endpoint");
    request(AUTH_ENDPOINT).then(({ access_token, expires_in }) => {
      const newToken = {
        value: access_token,
        expiration: Date.now() + (expires_in - 20) * 1000,
      };
      localStorage.setItem(TOKEN_KEY, JSON.stringify(newToken));
      this.authLoading = false;
      this.token = newToken.value;
      this.getTrack(newToken.value);
    });
  }

  getTrack = async (t: any) => {
    this.gameLoading = true;

    while (!this.track || !this.track.previewUrl) {
      const response = await fetchFromSpotify({
        token: t,
        endpoint: `search?q=genre:${this.genre}&type=track&limit=50`,
      });
      let newTrack: any = response.tracks.items[Math.floor(Math.random() * response.tracks.items.length)];
      if (!newTrack.preview_url) {
        continue;
      }
      this.track = {
        id: newTrack.id,
        name: newTrack.name,
        previewUrl: newTrack.preview_url,
        detailsUrl: newTrack.href
      }
      this.correctArtistId = newTrack.artists[0].id;
      break;
    }

    this.getArtistOptions(t);
  };

  getArtistOptions = async (t: any) => {
    const response = await fetchFromSpotify({
      token: t,
      endpoint: `artists/${this.correctArtistId}`,
    });
    this.artistOptions.push({
      id: response.id,
      name: response.name,
      imgUrl: response.images[0].url
    })

    const responseTwo = await fetchFromSpotify({
      token: t,
      endpoint: `search?q=genre:${this.genre}&type=artist&limit=50`,
    });
    while (this.artistOptions.length < this.totalArtistOptions) {
      let option: any = responseTwo.artists.items[Math.floor(Math.random() * responseTwo.artists.items.length)]
      if (!this.artistOptions.some((artist) => artist.id === option.id)) {
        this.artistOptions.push({
          id: option.id,
          name: option.name,
          imgUrl: option.images[0].url
        });
      }
    }

    this.artistOptions = this.shuffle(this.artistOptions);
    this.gameLoading = false;
  }

  shuffle(options: Artist[]) {
    let shuffledOptions: Artist[] = options;
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }

    return shuffledOptions;
  }

  togglePopup() {
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('popup');
    const message = document.getElementById('message');

    if (overlay && popup && message) {
      if (overlay.style.display === 'block') {
        overlay.style.display = 'none';
        popup.style.display = 'none';
        this.newGame();
      } else {
        if (this.currentQuestion == this.totalQuestions && this.correct) {
          message.innerText = "You win!"
        } else {
          message.innerText = "Game Over"
        }
        overlay.style.display = 'block';
        popup.style.display = 'block';
      }
    }

    // if (this.overlay && this.popup && this.message) {
    //   const overlayDisplayStyle = window.getComputedStyle(this.overlay.nativeElement).getPropertyValue('display');
    //   console.log(overlayDisplayStyle);
    //   if (overlayDisplayStyle === 'block') {
    //     this.renderer.setStyle(this.overlay.nativeElement, 'display', 'none');
    //     this.renderer.setStyle(this.popup.nativeElement, 'display', 'none');
    //     this.newGame();
    //   } else {
    //     if (this.currentQuestion === this.totalQuestions && this.correct) {
    //       this.renderer.setProperty(this.message.nativeElement, 'innerText', 'You win!');
    //     } else {
    //       this.renderer.setProperty(this.message.nativeElement, 'innerText', 'Game Over');
    //     }
    //     console.log("popup should show")
    //     this.renderer.setStyle(this.overlay.nativeElement, 'display', 'block');
    //     this.renderer.setStyle(this.popup.nativeElement, 'display', 'block');
    //   }
    // }
  }

  select(id: string) {
    this.selectedArtistId = id;
    if (this.selectedArtistId === this.correctArtistId) {
      this.correct = true;
    } else {
      this.correct = false;
    }
  }

  submitAnswer() {
    if (this.correct) {
      this.confettiService.popConfetti();
      const wrongElement = document.getElementById('wrong');
      if (wrongElement) {
        wrongElement.style.display = 'none';
      }
      const correctElement = document.getElementById('correct');
      if (correctElement) {
        correctElement.style.display = 'block';
      }
    } else {
      const wrongElement = document.getElementById('wrong');
      if (wrongElement) {
        wrongElement.style.display = 'block';
      }
      this.guesses -= 1;
    }
    this.results();
  }

  results() {
    if (this.guesses <= 0) {
      console.log("lose");
      // lose popup
      this.togglePopup();
    }
    else if (this.currentQuestion == this.totalQuestions && this.correct) {
      console.log("win")
      // win popup
      this.confettiService.popConfetti();
      this.togglePopup();
    }
    else if (this.correct) {
      this.gameData.updateCurrentQuestion(this.currentQuestion + 1);
      this.gameData.updateGuesses(this.guesses);
      this.router.routeReuseStrategy.shouldReuseRoute = function () {
        return false;
      }
      this.router.navigateByUrl('/game');
    }
  }

  newGame() {
    this.gameData.updateCurrentQuestion(1);
    this.gameData.updateGuesses(4);
    this.router.navigateByUrl('/');
  }
}
