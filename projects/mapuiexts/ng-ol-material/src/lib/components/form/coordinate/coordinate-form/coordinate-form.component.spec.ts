import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordinateFormComponent } from './coordinate-form.component';

describe('CoordinateFormComponent', () => {
  let component: CoordinateFormComponent;
  let fixture: ComponentFixture<CoordinateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordinateFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoordinateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
