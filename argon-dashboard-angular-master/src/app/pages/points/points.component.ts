import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { points } from '../../interfaces/points';

@Component({
  selector: 'app-points',
  templateUrl: './points.component.html',
  styleUrls: ['./points.component.scss']
})
export class PointsComponent implements OnInit {

  pointsTable: points[] = [];
  year!: any;

  years: number[] = [];

  constructor(private http: HttpClient, 
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.getYears();
    this.getPoints();
  }

  getYears() {
    this.http.get<number[]>('http://localhost:3000/years').subscribe(data => {
      console.log(data);
      this.years = data;
    });
  }

  getPoints() {
    this.activatedRoute.paramMap.subscribe(params => {
      
      if (params.has('id')) {
        this.year = params.get('id');
        this.http.get<points[]>(`http://localhost:3000/pointstable/${this.year}`).subscribe(data => {
          console.log(data);
          this.pointsTable = data;  
        });
      } else {
        this.http.get<points[]>(`http://localhost:3000/pointstable/${this.years[0]}`).subscribe(data => {
          console.log(data);
          this.pointsTable = data;  
        });
      }
    });
  }

}
