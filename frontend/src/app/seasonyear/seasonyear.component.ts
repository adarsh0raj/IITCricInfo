import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-seasonyear',
  templateUrl: './seasonyear.component.html',
  styleUrls: ['./seasonyear.component.scss']
})
export class SeasonyearComponent implements OnInit {

  years: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getYears();
  }

  getYears() {
    this.http.get<number[]>('http://localhost:3000/years').subscribe(data => {
      console.log(data);
      this.years = data;
    });
  }

}
