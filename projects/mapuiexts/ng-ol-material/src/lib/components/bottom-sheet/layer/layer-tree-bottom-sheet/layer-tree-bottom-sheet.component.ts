import { Component, Input, Inject } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import Map from 'ol/Map';
import { NolmLayerTreeComponent } from '../../../tree/layer/layer-tree/layer-tree.component';

@Component({
  selector: 'nolm-layer-tree-bottom-sheet',
  standalone: true,
  imports: [NolmLayerTreeComponent],
  templateUrl: './layer-tree-bottom-sheet.component.html',
  styleUrl: './layer-tree-bottom-sheet.component.css',
})
export class NolmLayerTreeBottomSheetComponent {
  constructor(
    private _bottomSheetRef: MatBottomSheetRef<NolmLayerTreeBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { map: Map }
  ) {}
}
