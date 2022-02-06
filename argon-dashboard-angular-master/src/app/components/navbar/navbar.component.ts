import { Component, OnInit, ElementRef } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public focus;
  public listTitles: any[];
  public location: Location;
  constructor(location: Location,  private element: ElementRef, private router: Router) {
    this.location = location;
  }

  ngOnInit() {
    this.listTitles = ROUTES.filter(listTitle => listTitle);
  }
  getTitle(){
    var titlee = this.location.prepareExternalUrl(this.location.path());
    if(titlee.charAt(0) === '#'){
        titlee = titlee.slice( 1 );
    }

    for(var item = 0; item < this.listTitles.length; item++){
        if(this.listTitles[item].path === titlee){
            return this.listTitles[item].title;
        }
    }

    if (titlee.includes("pointstable")){
      return 'Points Table';
    }

    if (titlee.includes("matches")) {
      return 'Match Details';
    }
    
    if (titlee.includes("venues")) {
      return 'Venue Details';
    }

    if (titlee.includes("players")) {
      return 'Player Details';
    }
    
    return 'Dashboard';
  }

  getPath(){
    var titlee = this.location.prepareExternalUrl(this.location.path());
    if(titlee.charAt(0) === '#'){
        titlee = titlee.slice( 1 );
    }

    if (titlee.includes("pointstable")){
      return '/pointstable';
    }

    if (titlee.includes("matches")) {
      return '/matches';
    }
    
    if (titlee.includes("venues")) {
      return '/venues';
    }

    if (titlee.includes("players")) {
      return '/players';
    }

    return '/home';
  }

}
