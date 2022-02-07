import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueaddComponent } from './venueadd.component';

describe('VenueaddComponent', () => {
  let component: VenueaddComponent;
  let fixture: ComponentFixture<VenueaddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VenueaddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VenueaddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
