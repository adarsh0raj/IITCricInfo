import { Component, OnInit, ViewChild } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

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

        this.pieChartData.datasets = [
          { data: [this.venueDetails.matches_won_bat, this.venueDetails.matches_won_bowl, this.venueDetails.matches_draw],
        }];

      });
    });
  }

  goBack() {
    this.router.navigate(['/venues']);
  }

}
