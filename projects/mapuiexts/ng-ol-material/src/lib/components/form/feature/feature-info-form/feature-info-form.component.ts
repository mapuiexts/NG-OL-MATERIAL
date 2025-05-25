import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Feature } from 'ol';
import { NolmWmsGetFeatureInfoResult } from '../../../../services/wms/wms-get-feature-info.service';
import { Layer } from 'ol/layer';
import { type FeaturePropertyDefinition } from '../../../../services/feature/FeaturePropertyDefinition.model'

interface NolmFeatureInfoDataSource {
  name: string;
  value: any;
}

@Component({
  selector: 'nolm-feature-info-form',
  standalone: true,
  imports: [MatExpansionModule, FormsModule, MatButtonModule, MatTableModule, MatFormFieldModule],
  templateUrl: './feature-info-form.component.html',
  styleUrl: './feature-info-form.component.css',
})
export class NolmFeatureInfoFormComponent  {
  @Input({ required: true }) nolmData!: { featuresInfo: NolmWmsGetFeatureInfoResult[] };
  @Output() nolmClose: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('form') form: ElementRef | undefined;
  displayedColumns: string[] = ['name', 'value'];
  rawFeaturesInfo?: [{feauture: Feature, layer: Layer}];

  isOpenPanel() {
    if (this.form) {
      console.log('this.form.nativeElement.focus()');
      this.form.nativeElement.focus();
    }   
  }

  getDataSource(feature: Feature): NolmFeatureInfoDataSource[] {
    const properties = feature.getProperties();
    const geom_name = feature.getGeometryName();
    const names = Object.keys(properties);
    const dataSource: NolmFeatureInfoDataSource[] = [];
    names.forEach((name) => {
      if (name !== geom_name)
        dataSource.push({ name: name, value: properties[name] });
    });
    return dataSource;
  }

  getDataSourceFromFeatureInfo(featureInfo: NolmWmsGetFeatureInfoResult): NolmFeatureInfoDataSource[] {
    const feature = featureInfo.feature;
    const layer = featureInfo.layer;
    
    const featurePropertiesDef: FeaturePropertyDefinition[] = layer.get('featureProperties');
    if (featurePropertiesDef) {
      const dataSource: NolmFeatureInfoDataSource[] = [];
      featurePropertiesDef.forEach((propDef) => {
        const name =propDef.label || propDef.name;
        if (propDef.value && 'url' in propDef.value) {
          const value = propDef.value
          const url = value.url instanceof Function ? value.url(feature) : value.url;
          const text = value.text instanceof Function ? value.text(feature) : value.text;
          dataSource.push({ name: name, value: { url: url, text: text } });
        }
        else if (propDef.value instanceof Function) {
          const value = propDef.value(feature);
          dataSource.push({ name: name, value: value });
        }
        else if (propDef.value) {
          dataSource.push({ name: name, value: propDef.value });
        }
        else {
          const value = feature.get(propDef.name);
          dataSource.push({ name: name, value: value });
        }
      });
      return dataSource;
    } else {
      return this.getDataSource(feature);
    }
  }


  getFeatureDescription(featureInfo: NolmWmsGetFeatureInfoResult): string {
    const feature = featureInfo.feature;
    const layer = featureInfo.layer;
    const featureDescription: (feature: Feature) => string  = layer.get('featureDescription');
    if (featureDescription) {
      return featureDescription(feature);
    }
    return `${feature.getId()}`;
  }

  onClose(): void {
    this.nolmClose.emit();
  }
}
