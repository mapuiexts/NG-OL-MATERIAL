import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import Map from 'ol/Map';
import { NolmLayerTreeComponent } from '../../../tree/layer/layer-tree/layer-tree.component';

@Component({
  selector: 'nolm-layer-tree-dialog',
  standalone: true,
  imports: [MatDialogModule, NolmLayerTreeComponent],
  templateUrl: './layer-tree-dialog.component.html',
  styleUrl: './layer-tree-dialog.component.css',
})
export class NolmLayerTreeDialogComponent {
  constructor(
    private _dialogRef: MatDialogRef<NolmLayerTreeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { map: Map }
  ) {}
}
