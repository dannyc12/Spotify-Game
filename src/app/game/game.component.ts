import { Component, Input, OnInit } from '@angular/core';
import fetchFromSpotify, { request } from "../../services/api";
import * as Howl from 'howler';

const AUTH_ENDPOINT =
  "https://nuod0t2zoe.execute-api.us-east-2.amazonaws.com/FT-Classroom/spotify-auth-token";
const TOKEN_KEY = "whos-who-access-token";

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  @Input() artistOptions: Set<any> = new Set();
  @Input() guesses: number = 2;
  @Input() currentQuestion: number = 1;
  @Input() track: any | undefined;

  authLoading: boolean = false;
  gameLoading: boolean = false;
  correctArtistId: string = "";
  selectedArtistId: string= "";
  token: String = "";
  correct: boolean | undefined = undefined;
  totalArtistOptions: number = 3;
  totalQuestions: number = 3;
  genre: string = "rock"

  sound: Howl.Howl | undefined;

  constructor() { }

  ngOnInit(): void {
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
    while (!this.track || !this.track.preview_url) {
      const response = await fetchFromSpotify({
        token: t,
        endpoint: `search?q=genre:${this.genre}&type=track`,
      });
      this.track = response.tracks.items[Math.floor(Math.random() * response.tracks.items.length)];
    }
    this.getArtistOptions(t);
  };

  getArtistOptions = async (t: any) => {
    console.log(this.track)
    this.sound = new Howl.Howl({
      src: [this.track.preview_url],
      volume: 0.5,
      preload: true
    });
    this.correctArtistId = this.track.artists[0].id;
    const response = await fetchFromSpotify({
      token: t,
      endpoint: `artists/${this.correctArtistId}`,
    });
    this.artistOptions.add(response)

    // get random artists to match totalArtistOptions
    // shuffle artists
    const responseTwo = await fetchFromSpotify({
      token: t,
      endpoint: `search?q=genre:${this.genre}&type=artist`,
    });
    console.log(responseTwo);
    while (this.artistOptions.size < this.totalArtistOptions) {
      let option: any = responseTwo.artists.items[Math.floor(Math.random() * responseTwo.artists.items.length)]
      this.artistOptions.add(option);
    }

    this.artistOptions = this.shuffle(this.artistOptions);
    this.gameLoading = false;
  }

  shuffle(options: Set<any>) {
    const arrayFromSet = Array.from(options);
    for (let i = arrayFromSet.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arrayFromSet[i], arrayFromSet[j]] = [arrayFromSet[j], arrayFromSet[i]];
    }

    return new Set(arrayFromSet);
  }

  select(id: string) {
    this.selectedArtistId = id;
  }

  playAudio() {
    if (this.sound) {
      this.sound.play();
    }
  }

  submitAnswer() {
    if (this.correct) {

    } else {
      this.guesses -= 1;
    }
  }
}
