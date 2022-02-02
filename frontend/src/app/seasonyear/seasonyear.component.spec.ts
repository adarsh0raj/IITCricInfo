import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonyearComponent } from './seasonyear.component';

describe('SeasonyearComponent', () => {
  let component: SeasonyearComponent;
  let fixture: ComponentFixture<SeasonyearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeasonyearComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeasonyearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
