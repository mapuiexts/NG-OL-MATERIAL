import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NolmLayerTreeBottomSheetComponent } from './layer-tree-bottom-sheet.component';

describe('LayerTreeBottomSheetComponent', () => {
  let component: NolmLayerTreeBottomSheetComponent;
  let fixture: ComponentFixture<NolmLayerTreeBottomSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NolmLayerTreeBottomSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NolmLayerTreeBottomSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
