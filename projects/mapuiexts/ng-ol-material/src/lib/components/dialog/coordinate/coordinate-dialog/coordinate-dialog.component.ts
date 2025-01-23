import { Component, Inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NolmCoordinateFormComponent } from '../../../form/coordinate/coordinate-form/coordinate-form.component';
import { Map } from 'ol';

@Component({
  selector: 'nolm-coordinate-dialog',
  standalone: true,
  imports: [MatDialogModule, NolmCoordinateFormComponent, DragDropModule],
  templateUrl: './coordinate-dialog.component.html',
  styleUrl: './coordinate-dialog.component.css',
})
export class NolmCoordinateDialogComponent {
  constructor(
    private _dialogRef: MatDialogRef<NolmCoordinateDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { map: Map; coordinate: string; scale: number }
  ) {}

  onClose(): void {
    this._dialogRef.close(undefined);
  }

  onSubmit(event: {
    coordinate: string;
    projection: string;
    scale: number;
  }): void {
    this._dialogRef.close(event);
  }
}
