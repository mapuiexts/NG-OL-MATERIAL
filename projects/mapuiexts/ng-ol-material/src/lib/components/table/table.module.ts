import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NolmWfsFeatureTableComponent } from './wfs/wfs-feature-table/wfs-feature-table.component'; 



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NolmWfsFeatureTableComponent
  ],
  exports: [
    NolmWfsFeatureTableComponent
  ]
})
export class NolmTableModule { }
