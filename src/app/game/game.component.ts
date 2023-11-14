import { Component, Input, OnInit } from '@angular/core';
import fetchFromSpotify, { request } from "../../services/api";
import Track from '../models/track';
import Artist from '../models/artist';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from 'src/services/game';

const AUTH_ENDPOINT =
  "https://nuod0t2zoe.execute-api.us-east-2.amazonaws.com/FT-Classroom/spotify-auth-token";
const TOKEN_KEY = "whos-who-access-token";

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  @Input() artistOptions: Artist[] = [];
  @Input() track: Track | undefined;
  @Input() guesses: number = 2;
  currentQuestion: number = 1;

  authLoading: boolean = false;
  gameLoading: boolean = false;
  correctArtistId: string = "";
  selectedArtistId: string = "";
  token: String = "";
  correct: boolean | undefined = undefined;
  totalArtistOptions: number = 3;
  totalQuestions: number = 3;
  genre: string = "rock"

  constructor(private gameData: GameService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.gameData.currentQuestion.subscribe(currentQuestion => this.currentQuestion = currentQuestion);
    this.gameData.guesses.subscribe(guesses => this.guesses = guesses);

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
      console.log(newTrack.artists)
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
    console.log(this.track)
    const response = await fetchFromSpotify({
      token: t,
      endpoint: `artists/${this.correctArtistId}`,
    });
    this.artistOptions.push({
      id: response.id,
      name: response.name,
      imgUrl: response.images[0].url
    })

    // get random artists to match totalArtistOptions
    // shuffle artists
    const responseTwo = await fetchFromSpotify({
      token: t,
      endpoint: `search?q=genre:${this.genre}&type=artist`,
    });
    console.log(responseTwo);
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

    if (overlay && popup) {
      if (overlay.style.display === 'block') {
        overlay.style.display = 'none';
        popup.style.display = 'none';
      } else {
        overlay.style.display = 'block';
        popup.style.display = 'block';
      }
    }
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
      console.log("correct");
    } else {
      console.log("wrong");
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
    else if (this.currentQuestion === this.totalQuestions && this.guesses > 0) {
      console.log("win")
      // win popup
      this.togglePopup();
    }
    else if (this.correct) {
      this.gameData.updateCurrentQuestion(this.currentQuestion + 1);
      this.gameData.updateGuesses(this.guesses);
      this.router.routeReuseStrategy.shouldReuseRoute = function() {
        return false;
      }
      this.router.navigateByUrl('/game');
    }
  }
}
