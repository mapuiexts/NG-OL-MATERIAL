import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerTreeButtonComponent } from './layer-tree-button.component';

describe('LayerTreeButtonComponent', () => {
  let component: LayerTreeButtonComponent;
  let fixture: ComponentFixture<LayerTreeButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayerTreeButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayerTreeButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
