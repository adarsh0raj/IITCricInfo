import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { match } from '../interfaces/match';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit {

  matches : match[] = [];
  skip: number = 0;
  limit: number = 10;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getMatches();
  }

  getMatches() {
    this.http.get<match[]>(`http://localhost:3000/matches/?skip=${this.skip}&limit=${this.limit}`).subscribe(data => {
      this.matches = data;
      console.log(this.matches);
    });
  }

}
