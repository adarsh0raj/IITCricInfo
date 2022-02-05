import { Routes } from '@angular/router';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { MatchComponent } from '../../pages/match/match.component';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { TablesComponent } from '../../pages/tables/tables.component';
import { MatchdetailComponent } from '../../pages/matchdetail/matchdetail.component';
import { VenueComponent } from 'src/app/pages/venue/venue.component';
import { VenuedetailComponent } from 'src/app/pages/venuedetail/venuedetail.component';
import { PointsComponent } from 'src/app/pages/points/points.component';

export const AdminLayoutRoutes: Routes = [
    { path: 'dashboard',      component: DashboardComponent },
    { path: 'user-profile',   component: UserProfileComponent },
    { path: 'tables',         component: TablesComponent },
    { path: 'icons',          component: IconsComponent },
    { path: 'matches',        component: MatchComponent },
    { path: 'matches/:id',    component: MatchdetailComponent },
    { path: 'venues',         component: VenueComponent },
    { path: 'venues/:id',     component: VenuedetailComponent },
    { path: 'pointstable',    component: PointsComponent },
    { path: 'pointstable/:id',component: PointsComponent }
];
