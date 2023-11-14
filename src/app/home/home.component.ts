import { Component, OnInit } from "@angular/core";
import fetchFromSpotify, { request } from "../../services/api";
import Track from "../models/track";
import Artist from "../models/artist";

const AUTH_ENDPOINT =
  "https://nuod0t2zoe.execute-api.us-east-2.amazonaws.com/FT-Classroom/spotify-auth-token";
const TOKEN_KEY = "whos-who-access-token";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  constructor() {}

  genres: String[] = ["House", "Alternative", "J-Rock", "R&B"];
  selectedGenre: String = "";
  authLoading: boolean = false;
  configLoading: boolean = false;
  token: String = "";
  numberOfTracks: number = 1;
  numberOfArtists: number = 2;

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

  async getTracks() {
    console.log("trying to get tracks...")
    const customParams = {'seed_genres': this.selectedGenre, 'limit': this.numberOfTracks}
    const response = await fetchFromSpotify({
      token: this.token,
      endpoint: "recommendations/",
      params: customParams
    });
    console.log("Tracks:  " + JSON.stringify(response))
    console.log(response.tracks[0])
    console.log(response.tracks[1])
    this.mapResponseToTracks(response.tracks[0])
  }

  setGenre(selectedGenre: any) {
    this.selectedGenre = selectedGenre;
    console.log(this.selectedGenre);
    console.log(TOKEN_KEY);
  }

  setNumberOfTracks(selectedNumber: any) {
    this.numberOfTracks = selectedNumber;
    console.log("User chose " + this.numberOfTracks + " tracks.")
  }

  setNumberOfArtists(selectedNumber: any) {
    this.numberOfArtists = selectedNumber;
    console.log("User chose " + this.numberOfArtists + " artists per question.")
  }

  mapResponseToTracks(trackResponse: any): Track {
    let trackArtist: Artist = {
      id: trackResponse.artists[0].id,
      name: trackResponse.artists[0].name,
      imgUrl: trackResponse.artists[0].images[0].url
    }
    let newTrack: Track = {
      id: trackResponse.id,
      name: trackResponse.name,
      previewUrl: trackResponse.preview_url,
      detailsUrl: trackResponse.href
    }
    for (let key in newTrack) {
      console.log(`${key}: ${key.valueOf}`)
    }
    return newTrack;
  }

  
}
