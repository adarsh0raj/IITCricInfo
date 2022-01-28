import { Component, OnInit } from '@angular/core';
import { AppServiceService } from './app-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'frontend';

  constructor(private appService: AppServiceService) {
  }

  ngOnInit(){
    this.getDataFromApi();
  }

  getDataFromApi(){
    this.appService.getData().subscribe((data) => {
       console.log('Response from Api is:', data);
    }, (error) => {
      console.log('Error from Api is:', error);
    })
  }

}
