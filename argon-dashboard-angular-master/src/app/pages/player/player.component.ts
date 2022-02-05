import { Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexFill,
  ApexYAxis,
  ApexTooltip,
  ApexTitleSubtitle,
  ApexXAxis
} from "ng-apexcharts";

import { player } from '../../interfaces/player';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis | ApexYAxis[];
  title: ApexTitleSubtitle;
  labels: string[];
  stroke: any; // ApexStroke;
  dataLabels: any; // ApexDataLabels;
};

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  playerDetails!: player;
  id!: any;
  
  // Bools for graphs
  public matchesPlayedNotZero = false;
  public matchesBowledNotZero = false;

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

  // Mixed Graph for Bowling Stats

  public chartOptions: ChartOptions = {
    series: [
      {
        name: "Runs Conceded",
        type: "column",
        data: []
      },
      {
        name: "Wickets Taken",
        type: "line",
        data: []
      }
    ],
    chart: {
      height: 400,
      width: 800,
      type: "line"
    },
    stroke: {
      width: [0, 4]
    },
    title: {
      text: "Bowling Stats"
    },
    dataLabels: {
      enabled: true,
      enabledOnSeries: [1]
    },
    labels: [],
    xaxis: {
      type: "category",
    },
    yaxis: [
      {
        title: {
          text: "Runs Conceded"
        }
      },
      {
        opposite: true,
        title: {
          text: "Wickets Taken"
        }
      }
    ]
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

        // Setting Bools
        if (this.playerDetails.runs_match.length != 0) {
          this.matchesPlayedNotZero = true;
        }
        if (this.playerDetails.matches_bowled != 0) {
          this.matchesBowledNotZero = true;
        }

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

        // Mixed Graph Data
        this.chartOptions.labels = this.playerDetails.runs_conceded_match.map(d => d.match_id.toString());
        this.chartOptions.series[0].data = this.playerDetails.runs_conceded_match.map(d => d.runs);
        this.chartOptions.series[1].data = this.playerDetails.runs_conceded_match.map(d => d.wickets);

      });
    });
  }

}
