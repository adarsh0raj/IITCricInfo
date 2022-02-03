import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  ApexMarkers
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  markers: ApexMarkers;
  title: ApexTitleSubtitle;
};

import { venue_details } from '../interfaces/venue';

@Component({
  selector: 'app-venuedetail',
  templateUrl: './venuedetail.component.html',
  styleUrls: ['./venuedetail.component.scss']
})
export class VenuedetailComponent implements OnInit {
  // @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  // Variables for route and details
  venueDetails!: venue_details;
  id!: any;

  //Pie chart

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      datalabels: {
        formatter: (value, ctx) => {
          if (ctx.chart.data.labels) {
            return ctx.chart.data.labels[ctx.dataIndex];
          }
        },
      },
    }
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [ 'Team batting 1st won', 'Team batting 2nd won', 'Draw' ],
    datasets: []
  };
  public pieChartType: ChartType = 'pie';
  public pieChartPlugins = [ DatalabelsPlugin ];

  // Line Chart

  public chartOptions: ChartOptions = {
    series: [
      {
        name: "Average 1st Innings Score",
        data: []
      }
    ],
    chart: {
      height: 350,
      type: "line",
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: "straight"
    },
    markers: {
      size: 5
    },
    title: {
      text: "Average 1st Innings Score For Different Seasons",
      align: "left"
    },
    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
        opacity: 0.5
      }
    },
    xaxis: {
      categories: []
    }
  };

  // Constructor and other methods

  constructor(private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private router: Router) { 
    }

  ngOnInit(): void { 
    this.getData();
  }

  getData() {
    this.activatedRoute.paramMap.subscribe(params => {
      console.log(params);
      this.id = params.get('id');
      this.http.get<venue_details>(`http://localhost:3000/venues/${this.id}`).subscribe(data => {
        console.log(data);
        this.venueDetails = data;

        // Pie Chart Data
        this.pieChartData.datasets = [
          { data: [this.venueDetails.matches_won_bat, this.venueDetails.matches_won_bowl, this.venueDetails.matches_draw],
        }];

        // Line Chart Data
        this.chartOptions.xaxis.categories = this.venueDetails.avg_first_innings_score.map(x => x.season_year.toString());
        this.chartOptions.series[0].data = this.venueDetails.avg_first_innings_score.map(x => x.score);

      });
    });
  }

  goBack() {
    this.router.navigate(['/venues']);
  }

}
