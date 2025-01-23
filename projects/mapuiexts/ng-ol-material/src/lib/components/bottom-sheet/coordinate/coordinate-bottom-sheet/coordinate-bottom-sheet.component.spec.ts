import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NolmCoordinateBottomSheetComponent } from './coordinate-bottom-sheet.component';

describe('CoordinateBottomSheetComponent', () => {
  let component: NolmCoordinateBottomSheetComponent;
  let fixture: ComponentFixture<NolmCoordinateBottomSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NolmCoordinateBottomSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NolmCoordinateBottomSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
