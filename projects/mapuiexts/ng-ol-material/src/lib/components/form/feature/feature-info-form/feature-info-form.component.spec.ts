import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureInfoFormComponent } from './feature-info-form.component';

describe('FeatureInfoFormComponent', () => {
  let component: FeatureInfoFormComponent;
  let fixture: ComponentFixture<FeatureInfoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureInfoFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeatureInfoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
