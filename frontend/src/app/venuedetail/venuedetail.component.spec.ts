import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenuedetailComponent } from './venuedetail.component';

describe('VenuedetailComponent', () => {
  let component: VenuedetailComponent;
  let fixture: ComponentFixture<VenuedetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VenuedetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VenuedetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
