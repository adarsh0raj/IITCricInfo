import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { match_detail } from '../interfaces/match';

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
  title: ApexTitleSubtitle;
  labels: any;
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
      height: 350,
      type: "line",
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
      size: 1
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
      offsetY: -25,
      offsetX: -5
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
      text: "Pie Chart for Innings 1",
    },
    responsive: [
      {
          breakpoint: 480,
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
      text: "Pie Chart for Innings 2",
    },
    responsive: [
      {
          breakpoint: 480,
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

        //Pie Chart Data

        this.piechartOptions.series = [this.match.pie_chart_innings1[0].ones, this.match.pie_chart_innings1[0].twos, this.match.pie_chart_innings1[0].threes, this.match.pie_chart_innings1[0].fours, this.match.pie_chart_innings1[0].sixes, this.match.pie_chart_innings1[0].extras];
        this.piechartOptions2.series = [this.match.pie_chart_innings2[0].ones, this.match.pie_chart_innings2[0].twos, this.match.pie_chart_innings2[0].threes, this.match.pie_chart_innings2[0].fours, this.match.pie_chart_innings2[0].sixes, this.match.pie_chart_innings2[0].extras];
        
        console.log(this.piechartOptions);
        console.log(this.piechartOptions2);
      });
    });
  }
}
