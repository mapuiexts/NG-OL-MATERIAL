import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NolmMapComponent } from './map/map.component';
import { NolmMapControlDirective } from '../../directives/map/map/controls/map-control.directive';
import { NolmMapControlsComponent } from './map/map-controls/map-controls.component';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NolmMapComponent,
    NolmMapControlsComponent,
    NolmMapControlDirective,
  ],
  exports: [
    NolmMapComponent,
    NolmMapControlDirective,
    NolmMapControlsComponent,
  ]
})
export class NolmMapModule { }
