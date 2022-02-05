import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { venue_without_id } from 'src/app/interfaces/venue';

import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-venueadd',
  templateUrl: './venueadd.component.html',
  styleUrls: ['./venueadd.component.scss']
})
export class VenueaddComponent implements OnInit {

  venueForm = new FormGroup({
    venue_name: new FormControl(''),
    city_name: new FormControl(''),
    country_name: new FormControl(''),
    capacity: new FormControl(),
  });

  SERVER_URL = "http://localhost:3000/venues/add";

  constructor(private http: HttpClient) { }

  ngOnInit() {

  }

  onSubmit() {
    console.log(this.venueForm.value);
  }

}
