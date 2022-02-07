import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { venue_without_id } from 'src/app/interfaces/venue';

@Component({
  selector: 'app-venueadd',
  templateUrl: './venueadd.component.html',
  styleUrls: ['./venueadd.component.scss']
})
export class VenueaddComponent implements OnInit {

  SERVER_URL = "http://localhost:3000/venues/add";

  constructor(private http: HttpClient) { }

  ngOnInit() {

  }

  onSubmit(item: any) {

    console.log(item.value);
    this.http.post<venue_without_id>(this.SERVER_URL, item.value).subscribe(
      (response) => {
        console.log(response);
      },
      (error) => {
        console.log(error);
      }
    );

    item.resetForm();
  }

}
