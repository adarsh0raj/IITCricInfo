import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { MatchComponent } from './match/match.component';
import { PlayerComponent } from './player/player.component';
import { PointsComponent } from './points/points.component';
import { VenueComponent } from './venue/venue.component';


const routes: Routes = [
  { path: 'home', component: AboutComponent },
  { path: 'matches', component: MatchComponent },
  { path: 'players', component: PlayerComponent },
  { path: 'pointstable', component: PointsComponent },
  { path: 'venues', component: VenueComponent },
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  { path: '**', component: AboutComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
