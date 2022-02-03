import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { match_detail } from '../interfaces/match';

@Component({
  selector: 'app-matchdetail',
  templateUrl: './matchdetail.component.html',
  styleUrls: ['./matchdetail.component.scss']
})
export class MatchdetailComponent implements OnInit {

  match!: match_detail;
  id!: any;

  constructor(private activatedRoute: ActivatedRoute,
    private http: HttpClient) { }

  ngOnInit(): void {
    this.getMatchDetails();
  }

  getMatchDetails() {
    this.activatedRoute.paramMap.subscribe(params => {
      console.log(params);
      this.id = params.get('id');
      this.http.get<match_detail>(`https://localhost:3000/matches/${this.id}`).subscribe(data => {
        this.match = data;
      });
    });
  }
}
