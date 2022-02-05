import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}
export const ROUTES: RouteInfo[] = [
    { path: '/home', title: 'Home',  icon: 'ni-shop text-primary', class: '' },
    { path: '/matches', title: 'Matches',  icon:'ni-building text-orange', class: '' },
    { path: '/players', title: 'Players',  icon:'ni-single-02 text-yellow', class: '' },
    { path: '/venues', title: 'Venues',  icon:'ni-pin-3 text-blue', class: '' },
    { path: '/pointstable', title: 'Points Table',  icon:'ni-bullet-list-67 text-red', class: '' },
    { path: '/venues/add', title: 'Add Venue',  icon:'ni-single-copy-04 text-green', class: '' }
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  public menuItems: any[];
  public isCollapsed = true;

  constructor(private router: Router) { }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
    this.router.events.subscribe((event) => {
      this.isCollapsed = true;
   });
  }
}
