import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerTreeDialogComponent } from './layer-tree-dialog.component';

describe('LayerTreeDialogComponent', () => {
  let component: LayerTreeDialogComponent;
  let fixture: ComponentFixture<LayerTreeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayerTreeDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayerTreeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
