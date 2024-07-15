import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NolmLayerTreeButtonComponent } from './layer/layer-tree-button/layer-tree-button.component';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NolmLayerTreeButtonComponent
  ],
  exports: [
    NolmLayerTreeButtonComponent
  ]
})
export class NolmButtonModule { }
