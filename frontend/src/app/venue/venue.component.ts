import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { venue, venue_details } from '../interfaces/venue';

@Component({
  selector: 'app-venue',
  templateUrl: './venue.component.html',
  styleUrls: ['./venue.component.scss']
})
export class VenueComponent implements OnInit {

  venues: venue[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getVenues();
  }

  getVenues() {
    this.http.get<venue[]>('http://localhost:3000/venues')
      .subscribe(data => {
        console.log(data);
        this.venues = data;
      });
  }

}
