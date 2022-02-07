import { Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { player_details } from '../../interfaces/match';

@Component({
  selector: 'app-playerlist',
  templateUrl: './playerlist.component.html',
  styleUrls: ['./playerlist.component.scss']
})
export class PlayerlistComponent implements OnInit {

  players: player_details[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.http.get<player_details[]>('http://localhost:3000/players').subscribe(data => {
      this.players = data;
    });
  }

}
