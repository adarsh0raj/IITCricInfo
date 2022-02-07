import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { match } from "../../interfaces/match";

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit {

  matches : match[] = [];
  skip: number = 0;
  limit: number = 10;
  matchesFinished: boolean = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getMatches();
  }

  getMatches() {

    this.http.get<match[]>(`http://localhost:3000/matches/?skip=${this.skip}&limit=${this.limit}`).subscribe(data => {
      this.matches = data;
      console.log(this.matches);

      if(this.matches.length < this.limit) {
        this.matchesFinished = true;
      }
      else {
        this.matchesFinished = false;
      }
    });
  }

  goBack() {
    if(this.skip == 0) {
      return;
    }
    this.skip -= 1;
    
    if (this.skip > 0) {
      document.getElementById("link1").classList.remove("disabled");
    }
    else {
      document.getElementById("link1").classList.add("disabled");
    }
    
    this.getMatches();
  }

  goNext() {
    if(this.matchesFinished) {
      return;
    }

    this.skip += 1;
    this.getMatches();

    if (this.matchesFinished) {
      document.getElementById("link2").classList.add("disabled");
    }
    else {
      document.getElementById("link1").classList.remove("disabled");
    }
  }
  
}


