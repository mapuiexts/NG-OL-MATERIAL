import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import Map from 'ol/Map';
import { NolmMapModule } from '../../../map/map.module';
import {
  MatBottomSheetModule,
  MatBottomSheet,
} from '@angular/material/bottom-sheet';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { NolmLayerTreeBottomSheetComponent } from '../../../bottom-sheet/layer/layer-tree-bottom-sheet/layer-tree-bottom-sheet.component';
import { NolmLayerTreeDialogComponent } from '../../../dialog/layer/layer-tree-dialog/layer-tree-dialog.component';
import { BreakpointObserver } from '@angular/cdk/layout';
@Component({
  selector: 'nolm-layer-tree-button',
  standalone: true,
  imports: [
    MatButtonModule,
    MatBottomSheetModule,
    MatDialogModule,
    MatIconModule,
    MatTooltipModule,
    NolmMapModule,
  ],
  templateUrl: './layer-tree-button.component.html',
  styleUrl: './layer-tree-button.component.css',
})
export class NolmLayerTreeButtonComponent implements OnInit, OnDestroy {
  @Input({ required: true }) map!: Map;
  constructor(
    private _bottomSheet: MatBottomSheet,
    private _dialog: MatDialog,
    private responsive: BreakpointObserver
  ) {}

  open: () => void = () => {};

  openBottomSheet(): void {
    this._bottomSheet.open(NolmLayerTreeBottomSheetComponent, {
      data: { map: this.map },
    });
  }

  openDialog(): void {
    this._dialog.open(NolmLayerTreeDialogComponent, {
      data: { map: this.map },
    });
  }

  ngOnInit(): void {
    this.open = this.openDialog;
    this.responsive.observe('(max-width: 600px)').subscribe((result) => {
      if (result.matches) {
        this.open = this.openBottomSheet;
      } else {
        this.open = this.openDialog;
      }
    });
  }

  ngOnDestroy(): void {
    this.responsive.ngOnDestroy();
  }

  
}
