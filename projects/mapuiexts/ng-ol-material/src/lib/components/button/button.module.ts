import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NolmLayerTreeButtonComponent } from './layer/layer-tree-button/layer-tree-button.component';
import { NolmAddCoordinateDirective } from '../../directives/button/coordinate/add-coordinate.directive';
import { NolmGetDistanceDirective } from '../../directives/button/measure/get-distance.directive';
import { NolmGetAreaDirective } from '../../directives/button/measure/get-area.directive';
import { NolmClearMeasureDirective } from '../../directives/button/measure/clear-measure.directive';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NolmLayerTreeButtonComponent,
    NolmAddCoordinateDirective,
    NolmGetDistanceDirective,
    NolmGetAreaDirective,
    NolmClearMeasureDirective
  ],
  exports: [
    NolmLayerTreeButtonComponent,
    NolmAddCoordinateDirective,
    NolmGetDistanceDirective,
    NolmGetAreaDirective,
    NolmClearMeasureDirective
  ]
})
export class NolmButtonModule { }
