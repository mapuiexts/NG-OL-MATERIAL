import { Component, Inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NolmFeatureInfoFormComponent } from '../../../form/feature/feature-info-form/feature-info-form.component';
import { Feature } from 'ol';
import { NolmWmsGetFeatureInfoResult } from '../../../../services/wms/wms-get-feature-info.service';

@Component({
  selector: 'nolm-feature-info-dialog',
  standalone: true,
  imports: [MatDialogModule, DragDropModule, NolmFeatureInfoFormComponent],
  templateUrl: './feature-info-dialog.component.html',
  styleUrl: './feature-info-dialog.component.css',
})
export class NolmFeatureInfoDialogComponent {
  constructor(
    private _dialogRef: MatDialogRef<NolmFeatureInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { featuresInfo: NolmWmsGetFeatureInfoResult[] }
  ) {}

  onClose(): void {
    this._dialogRef.close(undefined);
  }
}
