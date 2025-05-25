
import {
  AfterViewInit,
  Component,
  DestroyRef,
  OnDestroy,
  ViewChild,
  WritableSignal,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Feature, Map } from 'ol';
import { WriteGetFeatureOptions } from 'ol/format/WFS';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Geometry } from 'ol/geom';
import { VectorSourceEvent } from 'ol/source/Vector';
import { ObjectEvent } from 'ol/Object';
import { Style, Fill, Stroke, Circle } from 'ol/style';
import { StyleLike } from 'ol/style/Style';
import { NolmWfsDescribeFeatureTypeService } from '../../../../services/wfs/wfs-describe-feature-type.service';
import { NolmWfsDescribeFeatureTypeRequestOptions as DescribeFeatureTypeOptions } from '../../../../services/wfs/wfs-describe-feature-type-request.model';
import { Subscription } from 'rxjs';
import {
  MatPaginator,
  MatPaginatorDefaultOptions,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { ZoomToFeatures } from '../../../../utils/map/view';
import { FeaturePropertyDefinition } from '../../../../services/feature/FeaturePropertyDefinition.model'
import { MatIconModule } from '@angular/material/icon';
import { NolmWfsGetFeatureByBBoxDirective} from '../../../../directives/button/wfs/wfs-get-feature-by-bbox.directive'
import { NolmWfsGetFeatureByPolygonDirective } from '../../../../directives/button/wfs/wfs-get-feature-by-polygon.directive';
import GeoJSON from 'ol/format/GeoJSON';

const defaultSelectedFeatureStyle = new Style({
  stroke: new Stroke({
    color: 'rgba(204, 0, 204, 1.0)',
    width: 4,
  }),
  fill: new Fill({
    color: 'rgba(204, 0, 204, 0.4)',
  }),
  image: new Circle({
    radius: 10,
    fill: new Fill({
      color: 'rgba(204, 0, 204, 1.0)',
    }),
    stroke: new Stroke({
      color: '#000',
      width: 2,
    }),
  }),
  zIndex: 100,
});

export interface NolmWfsFeatureTableOptions {
  map: Map;
  url: string;
  wfsOptions: WriteGetFeatureOptions;
  layer?: VectorLayer<Feature<Geometry>>;
  highlightStyle?: StyleLike;
  properties?: FeaturePropertyDefinition[];
  multipleSelection?: boolean;
  filter?: boolean;
  paginatorOptions?: MatPaginatorDefaultOptions;
}

/**
 * Component to display a table with the features of a WFS layer.
 * The component fetches the metadata of the WFS layer and builds the table columns
 * and data based on the metadata.
 *
 * The features present in the WFS vector source are displayed in the table.
 * The table listens the events in the vector source and updates the table data accordingly.
 *
 * The table also provides a selection model to select the features in the table. Each selected
 * feature is highlighted in the map.
 */
@Component({
  selector: 'nolm-wfs-feature-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    MatSort,
    MatCheckboxModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatDividerModule,
    NolmWfsGetFeatureByBBoxDirective,
    NolmWfsGetFeatureByPolygonDirective,
  ],
  templateUrl: './wfs-feature-table.component.html',
  styleUrl: './wfs-feature-table.component.css',
})
export class NolmWfsFeatureTableComponent implements AfterViewInit, OnDestroy {
  /**
   * The options to configure the WFS Feature Table.
   *
   * The options include:
   *
   * - map: The map where the features are displayed.
   *
   * - url: The URL of the WFS service.
   *
   * - wfsOptions: The options to configure the WFS GetFeature request.
   *   If not provided, it will be retrieved from the layer.
   *
   * - layer: The vector layer where the features are displayed.
   *
   * - highlightStyle: The highlight style to be used to highlight on the map the selected features in the table.
   *
   * - properties: The properties definition to be used to build the table columns.
   *   If not provided, the component fetches the properties definition from the WFS layer
   *   or the WFS DescribeFeatureType request.
   *
   * - multipleSelection: Whether to allow multiple selection in the table. Default is true.
   *
   */
  nolmOptions = input.required<NolmWfsFeatureTableOptions>();

  /**
   * Output event to emit the selected features in the table.
   */
  onSelect = output<Feature[]>();
  /**
   * The MatSort component to be used in the table
   * to sort the columns.
   * @ignore
   */
  @ViewChild(MatSort) sort!: MatSort;

  /**
   * The MatPaginator component to be used in the table
   * to paginate the data.
   * @ignore
   */
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  showPaginator = signal(false);

  /**
   * The MatTableDataSource to be used in the table
   * to sort the data
   * @ignore
   */
  public dataSource = new MatTableDataSource<Object, MatPaginator>([]);
  /**
   * The selection model to select the features in the table
   * and highlight them in the map.
   * @ignore
   */
  public selection = new SelectionModel<Object>(true, []);
  /**
   * The columns to be displayed in the table,
   * including the 'select' column (checkbox).
   * @ignore
   */
  public displayedColumns: WritableSignal<string[]> = signal([]);

  /**
   * The service to fetch the metadata of the WFS layer.
   * @ignore
   */
  private wfsDescribeFeatureTypeService = inject(
    NolmWfsDescribeFeatureTypeService
  );
  /**
   * The vector layer where the features are displayed.
   * It is the vector layer provided in the options or a new vector layer
   * if not provided.
   * @ignore
   */
  private _layer?: VectorLayer<Feature<Geometry>>;
  /**
   * The vector source of the vector layer.
   * @ignore
   */
  public _source?: VectorSource;
  /**
   * Whether to allow multiple selection in the table.
   * If not provide in the options, the default is true.
   * @ignore
   */
  public _multipleSelection?: boolean = undefined;

  public selectedFilterProperty: string | null = null;

  private defaultFilterPredicate = this.dataSource.filterPredicate;

  private customFilterPredicate = this.createCustomFilter();
  /**
   * The properties definition to be used to build the table columns.
   * If not provided in the options, the component fetches the properties
   * definition from the WFS layer or the WFS DescribeFeatureType request.
   * @ignore
   */
  public propertiesDefinition?: FeaturePropertyDefinition[];
  /**
   * The subscription to the WFS DescribeFeatureType request.
   * @ignore
   */
  private destroyRef = inject(DestroyRef);
  /**
   * The subscription to the WFS DescribeFeatureType request.
   * @ignore
   */
  private subscription?: Subscription;
  /**
   * The highlight style to be used to highlight on the map the
   * selected features in the table. If not provided in the options,
   * the default style is used.
   * @ignore
   */
  private highlightStyle: StyleLike = defaultSelectedFeatureStyle;

  /**
   * After the view has been initialized, fetch the metadata of the WFS layer
   * and build the table columns and data.
   * @ignore
   */
  ngAfterViewInit() {
    this.highlightStyle =
      this.nolmOptions().highlightStyle || defaultSelectedFeatureStyle;
    this.dataSource.sort = this.sort;
    if (this.nolmOptions().paginatorOptions) {
      this.showPaginator.set(true);
      this.dataSource.paginator = this.paginator as MatPaginator;
    }
    this._multipleSelection =
      this.nolmOptions().multipleSelection === undefined
        ? true
        : this.nolmOptions().multipleSelection;
    this._layer =
      this.nolmOptions().layer ||
      new VectorLayer({ source: new VectorSource() });
    this._source = this._layer.getSource() as VectorSource;
    this.propertiesDefinition =
      this.nolmOptions().properties || this._layer.get('featureProperties');
    if (this.propertiesDefinition) {
      const columns = this.buildDisplayedColumns(this.propertiesDefinition);
      this.displayedColumns.set(columns);
    }
    this.registerVectorSourceHandlers(this._source);
    this.registerFeaturePropertyChangeHandler(this._source.getFeatures());

    if (!this.propertiesDefinition) {
      const url = this.nolmOptions().url;
      const featurePrefix = this.nolmOptions().wfsOptions.featurePrefix;
      const featureTypes = this.nolmOptions().wfsOptions.featureTypes;
      const describeFeatureTypeOptions: DescribeFeatureTypeOptions = {
        typeNames: `${featurePrefix}:${featureTypes}`,
      };

      this.subscription = this.wfsDescribeFeatureTypeService
        .fetch(url, describeFeatureTypeOptions)
        .subscribe({
          next: (describeFeatureType) => {
            const metadata = describeFeatureType.featureTypes[0].properties;
            this.propertiesDefinition =
              this.buildDefaultPropertiesDefinition(metadata);
            this.displayedColumns.set(
              this.buildDisplayedColumns(this.propertiesDefinition)
            );
            if (this._source) {
              this.dataSource.data = this.buildData(
                this._source.getFeatures(),
                this.propertiesDefinition
              );
            }
          },
          error: (error: Error) => {
            console.error('WFS DescribeFeatureType Error: ', error);
          },
          complete: () => {
            console.log('WFS DescribeFeatureType Complete');
          },
        });

      this.destroyRef.onDestroy(() => {
        this.subscription?.unsubscribe();
      });
    }
  }


  /**
   * Build the columns to be displayed in the table.
   * @param properties The properties definition to be used to build the columns.
   * @returns The columns to be displayed in the table.
   * @ignore
   * */
  private buildDisplayedColumns(properties: FeaturePropertyDefinition[]) {
    const columns: string[] = [];
    properties.forEach((property) => {
      const label = property.label || property.name;
      columns.push(label);
    });
    return ['__select', ...columns];
  }

  /**
   * Build the default properties definition from the feature type properties.
   * @param featureTypeProps FeatureType properties from where to build the properties definition.
   * @returns The properties definition.
   * @ignore
   */
  private buildDefaultPropertiesDefinition(featureTypeProps: any) {
    const properties: FeaturePropertyDefinition[] = [];
    featureTypeProps.forEach((property: any) => {
      properties.push({
        name: property.name
      });
    });
    return properties;
  }

  /**
   * Build the data to be used in the table from the input features.
   * @param features The features from where to build the data.
   * @param properties The properties definition to be used to build the data.
   * @returns The data to be used in the table.
   * @ignore
   * */
  private buildData(
    features: Feature[],
    properties: FeaturePropertyDefinition[]
  ): Object[] {
    const data: Object[] = [];
    features.forEach((feature) => {
      const item: any = {}; 
      properties.forEach((property) => {
        const name = property.label || property.name;
        if (property.value && 'url' in property.value) {
          const value = property.value;
          const url = value.url instanceof Function ? value.url(feature) : value.url;
          const text = value.text instanceof Function ? value.text(feature) : value.text;
          //item[name] = { url: url, text: text };
          item[name] = url;
        }
        else if (property.value instanceof Function) {
          const value = property.value(feature);
          item[name] = value;
        } 
        else if (property.value) {
          item[name] = property.value; // If value is a static value, assign it directly
        }
        else {
          const value = feature.get(property.name);
          item[name] = value;
        }
        // If the value is a Geometry, it is not added to the item
        if ((item[name] instanceof Geometry)) {
          delete item[name];
        }
        // const value = property.value
        //   ? property.value(feature)
        //   : feature.get(property.name);
        // if (!(value instanceof Geometry)) {
        //   item[property.label || property.name] = value;
        // }

      });
      item['__feature'] = feature;
      data.push(item);
    });
    return data;
  }
  // private buildData(
  //   features: Feature[],
  //   properties: FeaturePropertyDefinition[]
  // ): Object[] {
  //   const data: Object[] = [];
  //   features.forEach((feature) => {
  //     const item: { [key: string]: any } = {}; // Explicitly define the type of 'item'
  //     properties.forEach((property) => {
  //       const value = property.value
  //         ? property.value(feature)
  //         : feature.get(property.name);
  //       if (!(value instanceof Geometry)) {
  //         item[property.label || property.name] = value;
  //       }
  //     });
  //     item['__feature'] = feature;
  //     data.push(item);
  //   });
  //   return data;
  // }

  /**
   * Method to get the url of the link property of a feature.
   * @param feature The feature from where to get the link value.
   * @param index The index of the property definition.
   * @returns The link value.
   * @ignore
   */
  public getUrlLink(feature: Feature, index: number): string {
    const property = this.propertiesDefinition?.[index];
    if (property && property.value && property.value.url) {
      //return property.link(feature);
      //return property.value.link instanceof Function
      if (property.value.url instanceof Function) {
        return property.value.url(feature);
      }
      else {
        return property.value.url;
      }
    }
    return '';
  }

  /**
   * Handler for the 'addfeature' event of the vector source.
   * This handler adds the feature to the table data source
   * once the feature is added to the vector source.
   * @param {VectorSourceEvent} event The event object containing the added feature.
   * @ignore
   */
  private onFeatureAddHandler = (event: VectorSourceEvent) => {
    const feature = event.feature as Feature;
    feature.on('propertychange', this.onFeaturePropertyChangeHandler);
    const data = this.buildData([feature], this.propertiesDefinition || []);
    this.dataSource.data = [...this.dataSource.data, ...data];
  };

  /**
   * Handler for the 'removefeature' event of the vector source.
   * This handler removes the feature from the table data source
   * once the feature is removed from the vector source.
   * @param {VectorSourceEvent} event The event object containing the removed feature.
   * @ignore
   */
  private onFeatureRemoveHandler = (event: VectorSourceEvent) => {
    const feature = event.feature as Feature;
    feature.un('propertychange', this.onFeaturePropertyChangeHandler);
    const ds = this.buildData([feature], this.propertiesDefinition || []);
    const newData = this.dataSource.data.filter((item) => {
      const it = item as any;
      const itemFeature = it['__feature'] as Feature;
      return itemFeature !== feature;
    });
    this.dataSource.data = newData;
    //deselect row if data is empty
    if (this.dataSource.data.length === 0) {
      this.selection.clear();
    }
  };

  /**
   * Handler for the 'changefeature' event of the vector source.
   * This handler updates the feature properties in the table data source
   * once the feature properties are changed in the vector source.
   * @param {VectorSourceEvent} event
   * @ignore
   */
  private onFeatureChangeHandler = (event: VectorSourceEvent) => {
    const feature = event.feature as Feature;
    const newItemData = this.buildData(
      [feature],
      this.propertiesDefinition || []
    )[0];
    const oldData = this.dataSource.data;
    const index = oldData.findIndex((item) => {
      const it = item as any;
      const itemFeature = it['__feature'] as Feature;
      return itemFeature === feature;
    });
    //copy the new item data to the old data without
    //change the reference
    Object.assign(oldData[index], newItemData);
    this.dataSource.data = [...this.dataSource.data];
  };

  /**
   * Handler for the 'clear' event of the vector source.
   * This handler clears the table data source
   * once the vector source is cleared.
   * @ignore
   * */
  private onFeatureClearHandler = () => {
    if (this.dataSource.data.length > 0) this.dataSource.data = [];
    this.selection.clear();
  };

  /**
   * Method to register the event handlers for the vector source.
   * @param {VectorSource} source The vector source for which to register the event handlers.
   * @ignore
   */
  private registerVectorSourceHandlers(source: VectorSource) {
    source.on('addfeature', this.onFeatureAddHandler);
    source.on('removefeature', this.onFeatureRemoveHandler);
    //TODO: to change this event to 'propertychange' because style change fire 'changefeature'
    //source.on('changefeature', this.onFeatureChangeHandler);
    source.on('clear', this.onFeatureClearHandler);
  }

  /**
   * Method to unregister the event handlers for the vector source.
   * @param {VectorSource} source The vector source for which to unregister the event handlers.
   * @ignore
   */
  private unregisterVectorSourceHandlers(source: VectorSource) {
    source.un('addfeature', this.onFeatureAddHandler);
    source.un('removefeature', this.onFeatureRemoveHandler);
    source.un('clear', this.onFeatureClearHandler);
  }

  /**
   * Handler for the 'propertychange' event of the feature.
   * This handler updates the row in the table data source
   * once the feature properties are changed.
   * @param {ObjectEvent} event The event object containing the changed feature.
   * @ignore
   * */
  private onFeaturePropertyChangeHandler = (event: ObjectEvent) => {
    const feature = event.target as Feature;
    const newItemData = this.buildData(
      [feature],
      this.propertiesDefinition || []
    )[0];
    const oldData = this.dataSource.data;
    const index = oldData.findIndex((item) => {
      const it = item as any;
      const itemFeature = it['__feature'] as Feature;
      return itemFeature === feature;
    });
    //copy the new item data to the old data without
    //change the reference
    Object.assign(oldData[index], newItemData);
    this.dataSource.data = [...this.dataSource.data];
  };

  /**
   * Register the feature property change handlers.
   * @param features The features for which to register the property change handlers.
   * @ignore
   */
  private registerFeaturePropertyChangeHandler(features: Feature[]) {
    features.forEach((feature) => {
      feature.on('propertychange', this.onFeaturePropertyChangeHandler);
    });
  }

  /**
   * Unregister the feature property change handlers.
   * @param features The features for which to unregister the property change handlers.
   * @ignore
   */
  private unregisterFeaturePropertyChangeHandler(features: Feature[]) {
    features.forEach((feature) => {
      feature.un('propertychange', this.onFeaturePropertyChangeHandler);
    });
  }

  /**
   * Whether the number of selected elements matches the total number of rows.
   * @returns True if all rows are selected, false otherwise.
   * @ignore
   */
  public isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /**
   * Selects all rows if they are not all selected;
   * otherwise clear selection.
   * @ignore
   */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  /**
   * Handler for the change event of the header checkbox.
   * This handler selects or deselects all the rows in the table
   * and highlights or unhighlights the features in the map.
   * @param {MatCheckboxChange} event
   * @ignore
   */
  onChangeHeaderCheckbox(event: MatCheckboxChange) {
    if (event.checked) {
      const features: Feature[] = [];
      this.dataSource.data.forEach((row) => {
        if (!this.selection.isSelected(row)) {
          this.selection.select(row);
          const _row = row as any;
          const feature = _row['__feature'] as Feature;
          features.push(feature);
          this.highlightFeature(feature);
        }
      });
      this.onSelect.emit(features);
    } else {
      this.dataSource.data.forEach((row) => {
        if (this.selection.isSelected(row)) {
          this.selection.deselect(row);
          const _row = row as any;
          const feature = _row['__feature'] as Feature;
          this.unhighlightFeature(feature);
        }
      });
      this.selection.clear();
      this.onSelect.emit([]);
    }
    this.zoomToSelectedFeatures();
  }

  /**
   * Handler for the change event of the row checkbox.
   * This handler selects or deselects the row in the table
   * and highlights or unhighlights the feature in the map.
   * @param {MatCheckboxChange} event
   * @param {any} row The row object containing
   * the feature to highlight or unhighlight.
   * @ignore
   * */
  onChangeRowCheckbox(event: MatCheckboxChange, row: any) {
    const feature = row['__feature'] as Feature;
    if (this._multipleSelection === false) {
      if (event.checked) {
        //unhighlight the previous selected feature
        if (this.selection.selected.length > 0) {
          this.selection.selected.forEach((selectedRow) => {
            this.unhighlightFeature(
              (selectedRow as any)['__feature'] as Feature
            );
          });
          this.selection.clear();
        }
        //highlight and select the new feature
        this.highlightFeature(feature);
        this.selection.select(row);
        this.onSelect.emit([feature]);
      } else {
        this.unhighlightFeature(feature);
        this.selection.deselect(row);
        this.onSelect.emit([]);
      }
    } else if (event.checked) {
      this.highlightFeature(feature);
      this.selection.select(row);
      const features = this.getSelectedFeatures();
      this.onSelect.emit(features);
    } else {
      this.unhighlightFeature(feature);
      this.selection.deselect(row);
      const features = this.getSelectedFeatures();
      this.onSelect.emit(features);
    }
    this.zoomToSelectedFeatures();
  }

  /**
   * Method to zoom to the selected features in the map.
   * @ignore
   */
  public zoomToSelectedFeatures() {
    const features = this.getSelectedFeatures();
    ZoomToFeatures(this.nolmOptions().map, features);
  }

  public onZoomToSelectedFeatures() {
    this.zoomToSelectedFeatures();
  }

  public onZoomToAllFeatures() {
    const features = this._source?.getFeatures();
    if (features) {
      ZoomToFeatures(this.nolmOptions().map, features);
    }
  }

  public onZoomToFeature(event: any, row: any) {
    const feature = row['__feature'] as Feature;
    ZoomToFeatures(this.nolmOptions().map, [feature]);
  }

  public onRemoveFeature(event: any, row: any) {
    const feature = row['__feature'] as Feature;
    const features = this.getSelectedFeatures();
    if (features.find((f) => f === feature)) {
      this.selection.deselect(row);
      this.onSelect.emit(this.getSelectedFeatures());
    }
    this._source?.removeFeature(feature);
  }

  public onExportAllFeaturesToGeoJSON() {
    const features = this._source?.getFeatures();
    if (features) {
      this.exportFeaturesToGeoJson(features);
    }
  }

  public onExportSelectedFeaturesToGeoJSON() {
    const features = this.getSelectedFeatures();
    this.exportFeaturesToGeoJson(features);
  }

  private exportFeaturesToGeoJson(features: Feature[]) {
    const geojson = new GeoJSON().writeFeaturesObject(features);
    const blob = new Blob([JSON.stringify(geojson, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'features.geojson';
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Method to highlight the feature in the map.
   * @param {Feature} feature Feature to highlight.
   * @ignore
   */
  private highlightFeature(feature: Feature) {
    if (
      feature.getStyle() instanceof Array &&
      this.highlightStyle instanceof Style
    ) {
      const styles = feature.getStyle() as Style[];
      styles.push(this.highlightStyle);
      feature.setStyle(styles);
    } else {
      feature.setStyle(this.highlightStyle);
    }
  }

  /**
   * Method to unhighlight the feature in the map.
   * @param {Feature} feature Feature to unhighlight.
   * @ignore
   */
  private unhighlightFeature(feature: Feature) {
    if (feature.getStyle() instanceof Array) {
      const styles = feature.getStyle() as Style[];
      const newStyles = styles.filter((style) => style !== this.highlightStyle);
      feature.setStyle(newStyles);
    } else {
      feature.setStyle(undefined);
    }
  }

  /**
   * Method to get the selected features from the selection model.
   * @returns The selected features.
   * @ignore
   */
  private getSelectedFeatures(): Feature[] {
    return this.selection.selected.map((row) => {
      const _row = row as any;
      return _row['__feature'] as Feature;
    });
  }

  public clearLayer() {
    if (this._source) {
      this._source.clear();
    }
  }

  /**
   * Method to apply a filter to the table data
   * once the filter value is changed.
   * @param event
   * @ignore
   */
  onFilterChange(event: Event) {
    let filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if(this.selectedFilterProperty === null) {
      this.dataSource.filter = filterValue;
    }
    else {
      let filter: any = {};
      filter[this.selectedFilterProperty] = filterValue;
      this.dataSource.filter = JSON.stringify(filter);
    }

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public onPropertySelectionChange() {
    if (this.selectedFilterProperty === null) {
      this.dataSource.filterPredicate = this.defaultFilterPredicate;
    } else {
      this.dataSource.filterPredicate = this.customFilterPredicate;
    }
  }

  /**
   * Method to create a custom filter function that filter on the 
   * specified columns defined in the filter parameter in json format
   * converted to string
   * See: https://www.freakyjolly.com/angular-material-table-custom-filter-using-select-box/#google_vignette
   *
   * @returns The custom filter function
   * @ignore
   */
  private createCustomFilter() {
    let filterFunction = function (data: any, filter: string): boolean {
      let searchTerms = JSON.parse(filter);
      let isFilterSet = false;
      for (const col in searchTerms) {
        if (searchTerms[col].toString() !== '') {
          isFilterSet = true;
        } else {
          delete searchTerms[col];
        }
      }

      let nameSearch = () => {
        let found = false;
        if (isFilterSet) {
          for (const col in searchTerms) {
            searchTerms[col]
              .trim()
              .toLowerCase()
              .split(' ')
              .forEach((word: any) => {
                if (
                  data[col].toString().toLowerCase().indexOf(word) != -1 &&
                  isFilterSet
                ) {
                  found = true;
                }
              });
          }
          return found;
        } else {
          return true;
        }
      };
      return nameSearch();
    };
    return filterFunction;
  }

  /**
   * Method executed when the component is destroyed.
   * This method unregisters the event handlers for the vector source
   * and the feature property change handlers.
   * The vector source is cleared as well.
   * @ignore
   */
  ngOnDestroy() {
    if (this._source) {
      this.unregisterVectorSourceHandlers(this._source);
      this.unregisterFeaturePropertyChangeHandler(this._source.getFeatures());
      this._source.clear(true);
    }
  }
}
