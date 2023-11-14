import { Component, OnInit } from "@angular/core";
import fetchFromSpotify, { request } from "../../services/api";
import Track from "../models/track";
import Artist from "../models/artist";
import { GameService } from "src/services/game";
import { Router } from "@angular/router";

const AUTH_ENDPOINT =
  "https://nuod0t2zoe.execute-api.us-east-2.amazonaws.com/FT-Classroom/spotify-auth-token";
const TOKEN_KEY = "whos-who-access-token";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  constructor(private gameService: GameService, private router: Router) {}

  genres: String[] = ["House", "Alternative", "J-Rock", "R&B"];
  selectedGenre: String = this.gameService.getGameConfiguration().genre;
  authLoading: boolean = false;
  configLoading: boolean = false;
  token: String = "";
  numberOfTracks: number = this.gameService.getGameConfiguration().numberOfTracks;
  numberOfArtists: number = this.gameService.getGameConfiguration().numberOfArtists;
  difficulty: string = this.gameService.getGameConfiguration().difficulty;

  trackOptions: number[] = [1,2,3];

  ngOnInit(): void {
    this.authLoading = true;
    const storedTokenString = localStorage.getItem(TOKEN_KEY);
    console.log("game configuration at init: " + JSON.stringify(this.gameService.getGameConfiguration()));
    if (storedTokenString) {
      console.log("Stored token string: " + storedTokenString)
      const storedToken = JSON.parse(storedTokenString);
      if (storedToken.expiration > Date.now()) {
        console.log("Token found in localstorage");
        this.authLoading = false;
        this.token = storedToken.value;
        // this.loadGenres(storedToken.value);
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
      this.loadGenres(newToken.value);
    });
  }

  loadGenres = async (t: any) => {
    this.configLoading = true;
    console.log("trying to load genres...")
    const response = await fetchFromSpotify({
      token: t,
      endpoint: "recommendations/available-genre-seeds",
    });
    console.log(response);
    this.genres = response.genres;
    this.configLoading = false;
  };

  startGame() {
    // save the state before routing to game component
    this.gameService.setGameConfiguration({
      genre: this.selectedGenre,
      numberOfTracks: this.numberOfTracks,
      numberOfArtists: this.numberOfArtists,
      difficulty: this.difficulty
    });
    // user router here to ensure that our state is saved BEFORE we move to the game component
    console.log(`saved state: ${JSON.stringify(this.gameService.getGameConfiguration())}`)
    this.router.navigate(['/game']);
  }

  setGenre(selectedGenre: string) {
    this.selectedGenre = selectedGenre;
    console.log(this.selectedGenre);
    console.log(TOKEN_KEY);
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

  // NEEDS TESTING
  mapResponseToTracks(trackResponse: any): Track {
    let TrackArtist: Artist = {
      id: trackResponse.artists[0].id,
      name: trackResponse.artists[0].name,
      imgUrl: trackResponse.artists[0].images[0].url
    }
    let newTrack: Track = {
      id: trackResponse.id,
      name: trackResponse.name,
      // artists: [TrackArtist],
      previewUrl: trackResponse.preview_url,
      detailsUrl: trackResponse.href
    }
    for (let key in newTrack) {
      console.log(`${key}: ${key.valueOf}`)
    }
    return newTrack;
  }

  
}
