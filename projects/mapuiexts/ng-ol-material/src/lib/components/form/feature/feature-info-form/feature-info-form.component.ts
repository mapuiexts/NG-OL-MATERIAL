import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Feature } from 'ol';

interface NolmFeatureInfoDataSource {
  key: string;
  value: any;
}

@Component({
  selector: 'nolm-feature-info-form',
  standalone: true,
  imports: [MatExpansionModule, FormsModule, MatButtonModule, MatTableModule, MatFormFieldModule],
  templateUrl: './feature-info-form.component.html',
  styleUrl: './feature-info-form.component.css',
})
export class NolmFeatureInfoFormComponent {
  @Input({ required: true }) nolmData!: { features: Feature[] };
  @Output() nolmClose: EventEmitter<void> = new EventEmitter<void>();
  displayedColumns: string[] = ['key', 'value'];

  getDataSource(feature: Feature): NolmFeatureInfoDataSource[] {
    const properties = feature.getProperties();
    const geom_name = feature.getGeometryName();
    const keys = Object.keys(properties);
    const dataSource: NolmFeatureInfoDataSource[] = [];
    keys.forEach((key) => {
      if (key !== geom_name)
        dataSource.push({ key: key, value: properties[key] });
    });
    return dataSource;
  }

  onClose(): void {
    this.nolmClose.emit();
  }
}
