import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  ApexMarkers,
  ApexResponsive,
  ApexLegend
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

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  title: ApexTitleSubtitle;
  legend: ApexLegend;
  labels: any;
};

import { venue_details } from '../../interfaces/venue';

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

  public piechartOptions: PieChartOptions = {
    series: [],
    chart: {
      width: 480,
      type: "pie"
    },
    labels: ["Team batting First Won", "Team batting Second Won", "Draw"],
    title: {
      text: "Pie Chart for Venue Match Stats",
    },
    legend: {
      position: "bottom"
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

  // Line Chart

  public chartOptions: ChartOptions = {
    series: [
      {
        name: "Average 1st Innings Score",
        data: []
      }
    ],
    chart: {
      height: 400,
      width: 800,
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
        
        this.piechartOptions.series = [this.venueDetails.matches_won_bat, this.venueDetails.matches_won_bowl, this.venueDetails.matches_draw];

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
