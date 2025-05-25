import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfsFeatureTableComponent } from './wfs-feature-table.component';

describe('WfsFeatureTableComponent', () => {
  let component: WfsFeatureTableComponent;
  let fixture: ComponentFixture<WfsFeatureTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WfsFeatureTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfsFeatureTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
