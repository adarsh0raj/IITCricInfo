import { Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { player } from '../interfaces/player';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  playerDetails!: player;
  id!: any;

  // Bar Chart
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
      datalabels: {
        anchor: 'end',
        align: 'end'
      }
    }
  };

  public barChartType: ChartType = 'bar';
  public barChartPlugins = [ DatalabelsPlugin ];
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  constructor(private http: HttpClient,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.activatedRoute.paramMap.subscribe(params => {
      console.log(params);
      this.id = params.get('id');
      this.http.get<player>(`http://localhost:3000/players/${this.id}`).subscribe(data => {
        console.log(data);
        this.playerDetails = data;

        // Bar Chart Data
        this.barChartData.labels = this.playerDetails.runs_match.map(runs => runs.match_id);
        this.barChartData.datasets = [
          { data: this.playerDetails.runs_match.map(runs => runs.runs), label: 'Runs Scored' },
        ];

        // Change color of bar chart according to runs scored
        this.barChartData.datasets[0].backgroundColor = this.playerDetails.runs_match.map(runs => {
          if (runs.runs > 50) {
            return '#FF0000';
          } else if (runs.runs <= 50 && runs.runs >= 30 ) {
            return '#00FF00';
          } else if (runs.runs >= 20 && runs.runs < 30) {
            return '#0000FF';
          } else if (runs.runs < 20) {
            return '#FFFF00';
          } else {
            return '#000000';
          }
        });

      });
    });
  }

}
