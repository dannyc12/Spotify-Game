import { Component, OnInit } from "@angular/core";
import fetchFromSpotify, { request } from "../../services/api";
import Track from "../models/track";
import Artist from "../models/artist";
import { GameService } from "src/services/game.service";
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
  selectedGenre: String = "";
  authLoading: boolean = false;
  configLoading: boolean = false;
  token: String = "";
  numberOfTracks: number = 1;
  numberOfArtists: number = 2;

  // MOCK RESPONSE
  // mockResponse = {
  //   "artists": [
  //     {
  //       "images: [
  //         {
  //           "url": "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",
  //           "height": 300,
  //           "width": 300
  //         }
  //       ],

  //     }
  //   ]
  // }

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

  // // NEEDS TESTING
  // async getTracks() {
  //   console.log("trying to get tracks...")
  //   const customParams = {'seed_genres': this.selectedGenre, 'limit': this.numberOfTracks}
  //   const response = await fetchFromSpotify({
  //     token: this.token,
  //     endpoint: "recommendations/",
  //     params: customParams
  //   });
  //   console.log("Tracks:  " + JSON.stringify(response))
  //   console.log(response.tracks[0])
  //   console.log(response.tracks[1])
  //   this.mapResponseToTracks(response.tracks[0])
  // }

  startGame() {
    // save the state before routing to game component
    this.gameService.setGameState({
      genre: this.selectedGenre,
      numberOfTracks: this.numberOfTracks,
      numberOfArtists: this.numberOfArtists
    });
    // user router here to ensure that our state is saved BEFORE we move to the game component
    console.log(`saved state: ${JSON.stringify(this.gameService.getGameState())}`)
    // this.router.navigate(['/game']);
  }

  setGenre(selectedGenre: any) {
    this.selectedGenre = selectedGenre;
    console.log(this.selectedGenre);
    console.log(TOKEN_KEY);
  }

  setNumberOfTracks(selectedNumber: any) {
    this.numberOfTracks = selectedNumber;
    console.log("User chose " + this.numberOfTracks + " Tracks.")
  }

  setNumberOfArtists(selectedNumber: any) {
    this.numberOfArtists = selectedNumber;
    console.log("User chose " + this.numberOfArtists + " artists per question.")
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
