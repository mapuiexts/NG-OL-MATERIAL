import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerTreeComponent } from './layer-tree.component';

describe('LayerTreeComponent', () => {
  let component: LayerTreeComponent;
  let fixture: ComponentFixture<LayerTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayerTreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayerTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
