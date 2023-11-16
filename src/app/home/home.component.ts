import { Component, OnInit } from "@angular/core";
import fetchFromSpotify, { request } from "../../services/api";
import Track from "../models/track";
import Artist from "../models/artist";
import { GameService } from "src/services/game";
import { Router } from "@angular/router";

const AUTH_ENDPOINT =
  "https://nuod0t2zoe.execute-api.us-east-2.amazonaws.com/FT-Classroom/spotify-auth-token";
const TOKEN_KEY = "whos-who-access-token";

const CLIENT_ID = "79665c75791b47399b6606a26a49704a";
const CLIENT_SECRET = "4b952512e7d6442abcb61f7b858a3020";
const GRANT_TYPE = "client_credentials"

const SPOTIFY_ENDPOINT = "https://accounts.spotify.com/api/token"
const HEADERS = { "Content-Type": "application/x-www-form-urlencoded" }
const PERSONAL_TOKEN_KEY = ""

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  constructor(private gameService: GameService, private router: Router) { }

  genres: String[] = ["House", "Alternative", "J-Rock", "R&B", "accoustic", "anime", "bluegrass", "blues", "chill", "classical", "club",
                      "country", "death-metal", "disco", "disney", "dubstep", "edm", "folk", "funk", "emo", "gospel", "grunge"];
  validGenre: boolean = true;
  selectedGenre: String = this.gameService.getGameConfiguration().genre;
  authLoading: boolean = false;
  configLoading: boolean = false;
  token: String = "";
  numberOfTracks: number = this.gameService.getGameConfiguration().numberOfTracks;
  numberOfArtists: number = this.gameService.getGameConfiguration().numberOfArtists;
  difficulty: string = this.gameService.getGameConfiguration().difficulty;

  trackOptions: number[] = [1, 2, 3];

  getPersonalSpotifyToken() {
    console.log('Getting personal spotify token...')
    const body = new URLSearchParams();
    body.set('grant_type', GRANT_TYPE);
    body.set('client_id', CLIENT_ID);
    body.set('client_secret', CLIENT_SECRET);
    return request(SPOTIFY_ENDPOINT, { method: 'POST', headers: HEADERS, body: body.toString() }).then(({ access_token, expires_in }) => {
      const newToken = {
        value: access_token,
        expiration: Date.now() + (expires_in - 20) * 1000
      };
      console.log("Personal Token: " + newToken.value);
      localStorage.setItem(PERSONAL_TOKEN_KEY, JSON.stringify(newToken));
      this.authLoading = false;
      this.token = newToken.value;
      this.loadGenres(this.token);
    });
  }


  ngOnInit(): void {
    this.authLoading = true;
    const storedTokenString = localStorage.getItem(TOKEN_KEY);
    if (storedTokenString) {
      console.log("Stored token string: " + storedTokenString)
      const storedToken = JSON.parse(storedTokenString);
      if (storedToken.expiration > Date.now()) {
        console.log("Token found in localstorage");
        this.authLoading = false;
        this.token = storedToken.value;
        this.loadGenres(storedToken.value);
        return;
      }
    }
    this.getPersonalSpotifyToken();
    // console.log("Sending request to AWS endpoint");
    // request(AUTH_ENDPOINT).then(({ access_token, expires_in }) => {
    //   const newToken = {
    //     value: access_token,
    //     expiration: Date.now() + (expires_in - 20) * 1000,
    //   };
    //   localStorage.setItem(TOKEN_KEY, JSON.stringify(newToken));
    //   this.authLoading = false;
    //   this.token = newToken.value;
    //   this.loadGenres(this.token);
    // });
  }

  loadGenres = async (t: any) => {
    this.configLoading = true;
    console.log("trying to load genres...")
    try {
      const response = await fetchFromSpotify({
        token: t,
        endpoint: "recommendations/available-genre-seeds",
      });
      this.genres = response.genres;
    } catch (error) {
      console.error("Error:", error)
    } finally {
      this.configLoading = false;
    }
  };

  async startGame() {
    // save the state before routing to game component
    this.validGenre = true;
    await this.checkGenreTracks(this.token);
    if (this.validGenre) {
      this.gameService.setGameConfiguration({
        genre: this.selectedGenre,
        numberOfTracks: this.numberOfTracks,
        numberOfArtists: this.numberOfArtists,
        difficulty: this.difficulty
      });
      console.log(`saved state: ${JSON.stringify(this.gameService.getGameConfiguration())}`)
      console.log('valid genre?: ' + this.validGenre)
      this.router.navigate(['/game']);
    }
  }

  setGenre(selectedGenre: string) {
    this.selectedGenre = selectedGenre;
    console.log(this.selectedGenre);
  }

  setNumberOfTracks(selectedNumber: number) {
    this.numberOfTracks = selectedNumber;
    console.log("User chose " + this.numberOfTracks + " Tracks.")
  }

  setNumberOfArtists(selectedNumber: number) {
    this.numberOfArtists = selectedNumber;
    console.log("User chose " + this.numberOfArtists + " artists per question.")
  }

  setDifficulty(selectedDifficulty: string) {
    this.difficulty = selectedDifficulty;
    console.log("User chose difficulty: " + this.difficulty)
  }

  checkGenreTracks = async (t: any) => {
    const response = await fetchFromSpotify({
      token: t,
      endpoint: `search?q=genre:${this.selectedGenre}&type=track&limit=50`,
    });
    console.log('tracks in genre: ' + response.tracks.items.length);
    if (response.tracks.items.length < this.numberOfTracks) {
      this.validGenre = false;
    }

  }

}
