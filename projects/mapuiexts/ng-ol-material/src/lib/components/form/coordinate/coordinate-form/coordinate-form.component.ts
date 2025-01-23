import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Map } from 'ol';

@Component({
  selector: 'nolm-coordinate-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatIconModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './coordinate-form.component.html',
  styleUrl: './coordinate-form.component.css',
})
export class NolmCoordinateFormComponent implements OnInit {
  @Input({required: true}) nolmData!: {map: Map, coordinate: string, scale: number};
  @Output() nolmSubmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() nolmClose: EventEmitter<void> = new EventEmitter<void>();
  pattern = '^-?\\d+(\\.\\d+)?,\\s*-?\\d+(\\.\\d+)?$';
  coordinateForm : FormGroup = new FormGroup({});
  projections: string[] = []


  ngOnInit(): void {
    const mapProjCode = this.nolmData.map.getView().getProjection().getCode();
    this.coordinateForm = new FormGroup({
      coordinate: new FormControl(this.nolmData.coordinate, [
        Validators.required,
        Validators.pattern(this.pattern),
      ]),
      projection: new FormControl(mapProjCode, [Validators.required]),
      scale: new FormControl(this.nolmData.scale, [Validators.required]),
    });
    
    if(mapProjCode !== 'EPSG:4326'){
      this.projections.push(mapProjCode);
    }
    this.projections.push('EPSG:4326');
  }

  onClose(): void {
    this.nolmClose.emit();
  }

  onSubmit(): void {
    this.coordinateForm && this.nolmSubmit.emit(this.coordinateForm.value);
  }

  clearCoordinate(): void {
    this.coordinateForm.get('coordinate')?.setValue('');
  }
}