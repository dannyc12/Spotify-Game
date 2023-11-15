import { Component, Input, OnInit } from '@angular/core';
import Artist from 'src/app/models/artist';
import { GameService } from 'src/services/game';

@Component({
  selector: 'app-artist-card',
  templateUrl: './artist-card.component.html',
  styleUrls: ['./artist-card.component.css']
})
export class ArtistCardComponent implements OnInit {

  @Input() artist: Artist | undefined;
  @Input() selectedArtistId: string = "";
  difficulty = this.gameData.getGameConfiguration().difficulty;

  constructor(private gameData: GameService) { }

  ngOnInit(): void {
  }
}
