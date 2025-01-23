import { Directive, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NolmCoordinateDialogComponent } from '../../../components/dialog/coordinate/coordinate-dialog/coordinate-dialog.component';
import { NolmCoordinateBottomSheetComponent } from '../../../components/bottom-sheet/coordinate/coordinate-bottom-sheet/coordinate-bottom-sheet.component';
import { Map } from 'ol';
import { NolmCoordinateService } from '../../../services/coordinate/coordinate.service';

export interface NolmGoToCoordinateOptions {
  map: Map;
}

@Directive({
  selector: '[nolmGoToCoordinate]',
  standalone: true,
  host: {
    '(click)': 'onClick()',
  },
})
export class NolmGoToCoordinateDirective implements OnInit, OnDestroy {
  @Input({ required: true }) nolmGoToCoordinate!: NolmGoToCoordinateOptions;
  coordinateService = inject(NolmCoordinateService);
  data = {};
  open: () => void = () => {};

  constructor(
    private bottomSheet: MatBottomSheet,
    private dialog: MatDialog,
    private responsive: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.data = {
      map: this.nolmGoToCoordinate.map,
      coordinate: '',
      scale: 2000,
    };
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

  private openDialog(): void {
    let dialogRef = this.dialog.open(NolmCoordinateDialogComponent, {
      data: this.data,
      hasBackdrop: false,
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.handleResult(result);
    });
  }

  openBottomSheet(): void {
    let bottomSheetRef = this.bottomSheet.open(
      NolmCoordinateBottomSheetComponent,
      {
        data: this.data,
      }
    );
    bottomSheetRef.afterDismissed().subscribe((result) => {
      this.handleResult(result);
    });
  }

  onClick() {
    this.open();
  }

  private handleResult(result: any): void {
    if (result) {
      const map = this.nolmGoToCoordinate.map;
      let coordinate = this.coordinateService.stringToCoordinate(
        result.coordinate,
        result.projection
      );
      coordinate &&
        this.coordinateService.goToCoordinatePopup(
          map,
          coordinate,
          result.projection,
          result.scale
        );
    }
  }
}
