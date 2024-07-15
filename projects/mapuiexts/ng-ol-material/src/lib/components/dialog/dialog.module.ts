import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NolmLayerTreeDialogComponent } from './layer/layer-tree-dialog/layer-tree-dialog.component';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NolmLayerTreeDialogComponent
  ],
  exports: [
    NolmLayerTreeDialogComponent
  ]
})
export class NolmDialogModule { }
