import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NolmLayerTreeBottomSheetComponent } from './layer/layer-tree-bottom-sheet/layer-tree-bottom-sheet.component';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NolmLayerTreeBottomSheetComponent
  ],
  exports: [
    NolmLayerTreeBottomSheetComponent
  ]
})
export class NolmBottomSheetModule { }
