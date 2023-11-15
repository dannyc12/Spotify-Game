import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { AppComponent } from "./app.component";
import { HomeComponent } from "./home/home.component";
import { GameComponent } from './game/game.component';
import { ArtistCardComponent } from './game/artist-card/artist-card.component';
import { PopupComponent } from "./game/popup/popup.component";
import { GameService } from "src/services/game";
import { ConfettiService } from "src/services/confetti";

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'game', component: GameComponent },
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  declarations: [AppComponent, HomeComponent, GameComponent, ArtistCardComponent, PopupComponent],
  imports: [BrowserModule, FormsModule, RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  providers: [GameService, ConfettiService],
  bootstrap: [AppComponent],
})
export class AppModule { }
