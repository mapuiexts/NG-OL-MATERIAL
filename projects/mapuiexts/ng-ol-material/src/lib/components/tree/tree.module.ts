import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NolmLayerTreeComponent } from './layer/layer-tree/layer-tree.component';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NolmLayerTreeComponent
  ],
  exports: [
    NolmLayerTreeComponent
  ]
})
export class NolmTreeModule { }
