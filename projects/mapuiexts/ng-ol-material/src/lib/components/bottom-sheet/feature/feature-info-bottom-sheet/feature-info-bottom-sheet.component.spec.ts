import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureInfoBottomSheetComponent } from './feature-info-bottom-sheet.component';

describe('FeatureInfoBottomSheetComponent', () => {
  let component: FeatureInfoBottomSheetComponent;
  let fixture: ComponentFixture<FeatureInfoBottomSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureInfoBottomSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeatureInfoBottomSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
