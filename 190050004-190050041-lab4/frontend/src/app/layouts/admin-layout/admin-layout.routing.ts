import { Routes } from '@angular/router';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { MatchComponent } from '../../pages/match/match.component';
import { VenueaddComponent } from '../../pages/venueadd/venueadd.component';
import { MatchdetailComponent } from '../../pages/matchdetail/matchdetail.component';
import { VenueComponent } from 'src/app/pages/venue/venue.component';
import { VenuedetailComponent } from 'src/app/pages/venuedetail/venuedetail.component';
import { PointsComponent } from 'src/app/pages/points/points.component';
import { SeasonyearComponent } from 'src/app/pages/seasonyear/seasonyear.component';
import { PlayerComponent } from 'src/app/pages/player/player.component';
import { PlayerlistComponent } from 'src/app/pages/playerlist/playerlist.component';

export const AdminLayoutRoutes: Routes = [
    { path: 'home',      component: DashboardComponent },
    { path: 'venues/add',   component: VenueaddComponent },
    { path: 'matches',        component: MatchComponent },
    { path: 'matches/:id',    component: MatchdetailComponent },
    { path: 'venues',         component: VenueComponent },
    { path: 'venues/:id',     component: VenuedetailComponent },
    { path: 'pointstable',    component: SeasonyearComponent },
    { path: 'pointstable/:id',component: PointsComponent },
    { path: 'players',        component: PlayerlistComponent },
    { path: 'players/:id',  component: PlayerComponent}
];
