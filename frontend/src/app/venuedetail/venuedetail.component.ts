import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { venue_details } from '../interfaces/venue';

@Component({
  selector: 'app-venuedetail',
  templateUrl: './venuedetail.component.html',
  styleUrls: ['./venuedetail.component.scss']
})
export class VenuedetailComponent implements OnInit {

  venueDetails!: venue_details;
  id!: any;

  constructor(private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {

    this.activatedRoute.paramMap.subscribe(params => {
      console.log(params);
      this.id = params.get('id');
      this.http.get<venue_details>(`http://localhost:3000/venues/${this.id}`).subscribe(data => {
        console.log(data);
        this.venueDetails = data;
      });
    });

  }

  goBack() {
    this.router.navigate(['/venues']);
  }

}
