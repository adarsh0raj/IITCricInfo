import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { match_detail } from '../../interfaces/match';

import {
  ChartComponent,
  ApexNonAxisChartSeries,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexMarkers,
  ApexYAxis,
  ApexGrid,
  ApexTitleSubtitle,
  ApexLegend,
  ApexResponsive,
} from "ng-apexcharts";


export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  markers: ApexMarkers;
  colors: string[];
  yaxis: ApexYAxis;
  grid: ApexGrid;
  legend: ApexLegend;
  title: ApexTitleSubtitle;
};

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  legend: ApexLegend;
  title: ApexTitleSubtitle;
  labels: any;
};

export type players_11 = {
  team1_player: string;
  team2_player: string;
};

@Component({
  selector: 'app-matchdetail',
  templateUrl: './matchdetail.component.html',
  styleUrls: ['./matchdetail.component.scss']
})
export class MatchdetailComponent implements OnInit {

  // global main vars

  match!: match_detail;
  id!: any;
  playing_11: players_11[] = [];

  //line chart vars

  public chartOptions: ChartOptions = {
    series: [
      {
        name: "",
        data: []
      },
      {
        name: "",
        data: []
      }
    ],
    chart: {
      height: 400,
      type: "line",
      width: "90%",
      dropShadow: {
        enabled: true,
        color: "#000",
        top: 18,
        left: 7,
        blur: 10,
        opacity: 0.2
      },
      toolbar: {
        show: false
      }
    },
    colors: ["#0000ff", "#ff0000"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth"
    },
    title: {
      text: "Score Comparison",
      align: "left"
    },
    grid: {
      borderColor: "#e7e7e7",
      row: {
        colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
        opacity: 0.5
      }
    },
    markers: {
      size:0.1,
      discrete: []
    },
    xaxis: {
      categories: [],
      title: {
        text: "Over Id"
      }
    },
    yaxis: {
      title: {
        text: "Runs"
      },
      min: 0
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      floating: true,
      offsetY: -30,
      offsetX: -10
    }
  };

  // Pie chart
  public piechartOptions: PieChartOptions = {
    series: [],
    chart: {
      width: 380,
      type: "pie"
    },
    labels: ["Ones", "Twos", "Threes", "Fours", "Sixes", "Extra"],
    title: {
      text: "Innings 1",
    },
    legend : {
      position: 'bottom',
    },
    responsive: [
      {
          breakpoint: 300,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
      }
    ]
  };

  // Pie chart 2
  public piechartOptions2: PieChartOptions = {
    series: [],
    chart: {
      width: 380,
      type: "pie"
    },
    labels: ["Ones", "Twos", "Threes", "Fours", "Sixes", "Extra"],
    title: {
      text: "Innings 2",
    },
    legend : {
      position: 'bottom',
    },
    responsive: [
      {
          breakpoint: 300,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
      }
    ]
  };


  // Methods

  constructor(private activatedRoute: ActivatedRoute,
    private http: HttpClient) { }

  ngOnInit(): void {
    this.getMatchDetails();
  }

  getMatchDetails() {
    this.activatedRoute.paramMap.subscribe(params => {
      console.log(params);
      this.id = params.get('id');
      this.http.get<match_detail>(`http://localhost:3000/matches/${this.id}`).subscribe(data => {
        this.match = data;
        console.log(this.match);

        // Line chart data
        this.chartOptions.series[0].name = this.match.innings1_progress[0].team_name;
        this.chartOptions.series[1].name = this.match.innings2_progress[0].team_name;
        this.chartOptions.xaxis.categories = this.match.innings1_progress.map(innings => innings.over_id);
        this.chartOptions.series[0].data = this.match.innings1_progress.map(innings => innings.runs);
        this.chartOptions.series[1].data = this.match.innings2_progress.map(innings => innings.runs);

        for(let i=0; i<this.match.innings1_progress.length; i++){
          if(this.match.innings1_progress[i].wickets >= 1){
            this.chartOptions.markers.discrete.push({seriesIndex: 0, dataPointIndex: i, size:7, fillColor: "#0000ff", strokeColor: '#fff' ,  shape  : "circle"});
          }
          else {
            this.chartOptions.markers.discrete.push({seriesIndex: 0, dataPointIndex: i, size:0, fillColor: "#ff0000", strokeColor: '#fff', shape  : "circle"});
          }
        }

        for(let i=0; i<this.match.innings2_progress.length; i++){
          if(this.match.innings2_progress[i].wickets >= 1){
            this.chartOptions.markers.discrete.push({seriesIndex: 1, dataPointIndex: i, size:7, fillColor: "#ff0000", strokeColor: '#fff', shape  : "circle"});
          }
          else {
            this.chartOptions.markers.discrete.push({seriesIndex: 1, dataPointIndex: i, size:0, fillColor: "#ff0000", strokeColor: '#fff', shape  : "circle"});
          }
        }

        //Pie Chart Data
        var temp1 = [this.match.pie_chart_innings1[0].ones, this.match.pie_chart_innings1[0].twos, this.match.pie_chart_innings1[0].threes, this.match.pie_chart_innings1[0].fours, this.match.pie_chart_innings1[0].sixes, this.match.pie_chart_innings1[0].extras];
        var temp2 = [this.match.pie_chart_innings2[0].ones, this.match.pie_chart_innings2[0].twos, this.match.pie_chart_innings2[0].threes, this.match.pie_chart_innings2[0].fours, this.match.pie_chart_innings2[0].sixes, this.match.pie_chart_innings2[0].extras];

        const sum1 = Number(this.match.pie_chart_innings1[0].ones) + Number(this.match.pie_chart_innings1[0].twos) + Number(this.match.pie_chart_innings1[0].threes) + Number(this.match.pie_chart_innings1[0].fours) + Number(this.match.pie_chart_innings1[0].sixes) + Number(this.match.pie_chart_innings1[0].extras);
        const sum2 = Number(this.match.pie_chart_innings2[0].ones) + Number(this.match.pie_chart_innings2[0].twos) + Number(this.match.pie_chart_innings2[0].threes) + Number(this.match.pie_chart_innings2[0].fours) + Number(this.match.pie_chart_innings2[0].sixes) + Number(this.match.pie_chart_innings2[0].extras);

        for (let i = 0; i < temp1.length; i++) {
          temp1[i] = (Number(temp1[i])*100) / sum1;
        }

        for (let i = 0; i < temp2.length; i++) {
          temp2[i] = (Number(temp2[i])*100)/ sum2;
        }

        this.piechartOptions.series = temp1;
        this.piechartOptions2.series = temp2;

        // Players Table Data
        for (let i = 0; i < this.match.playing_11_team1.length; i++) {
          this.playing_11.push({
            "team1_player": this.match.playing_11_team1[i].player_name,
            "team2_player": this.match.playing_11_team2[i].player_name
          });
        }
        
      });
    });
  }
}
