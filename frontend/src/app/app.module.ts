import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgChartsModule } from 'ng2-charts';
import { NgApexchartsModule } from 'ng-apexcharts';

import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VenueComponent } from './venue/venue.component';
import { HomeComponent } from './home/home.component';
import { MatchComponent } from './match/match.component';
import { PlayerComponent } from './player/player.component';
import { PointsComponent } from './points/points.component';
import { AboutComponent } from './about/about.component';
import { VenuedetailComponent } from './venuedetail/venuedetail.component';

@NgModule({
  declarations: [
    AppComponent,
    VenueComponent,
    HomeComponent,
    MatchComponent,
    PlayerComponent,
    PointsComponent,
    AboutComponent,
    VenuedetailComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    NgChartsModule,
    NgApexchartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
