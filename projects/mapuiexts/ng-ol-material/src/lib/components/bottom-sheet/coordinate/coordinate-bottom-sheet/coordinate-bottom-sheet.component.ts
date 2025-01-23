import { Component, Inject, inject } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import Map from 'ol/Map';
import { NolmCoordinateFormComponent } from '../../../form/coordinate/coordinate-form/coordinate-form.component';

@Component({
  selector: 'nolm-coordinate-bottom-sheet',
  standalone: true,
  imports: [NolmCoordinateFormComponent],
  templateUrl: './coordinate-bottom-sheet.component.html',
  styleUrl: './coordinate-bottom-sheet.component.css'
})
export class NolmCoordinateBottomSheetComponent {
  constructor(
    private _bottomSheetRef: MatBottomSheetRef<NolmCoordinateBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { map: Map, coordinate: string; scale: number }
  ) {}

  onClose(): void {
    this._bottomSheetRef.dismiss(undefined);
  }

  onSubmit(event: {coordinate: string, projection: string, scale: number}): void {
    console.log('event in bottom-sheet received from form', event);
    this._bottomSheetRef.dismiss(event);
  }

}