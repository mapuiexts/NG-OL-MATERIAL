import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Feature } from 'ol';
import { NolmFeatureInfoFormComponent } from '../../../form/feature/feature-info-form/feature-info-form.component';
import { NolmWmsGetFeatureInfoResult } from '../../../../services/wms/wms-get-feature-info.service';

@Component({
  selector: 'app-wms-feature-info-bottom-sheet',
  standalone: true,
  imports: [NolmFeatureInfoFormComponent],
  templateUrl: './feature-info-bottom-sheet.component.html',
  styleUrl: './feature-info-bottom-sheet.component.css'
})
export class NolmFeatureInfoBottomSheetComponent {

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<NolmFeatureInfoBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data:  { featuresInfo: NolmWmsGetFeatureInfoResult[] }
  ) {}

  onClose(): void {
    this._bottomSheetRef.dismiss(undefined);
  }
}