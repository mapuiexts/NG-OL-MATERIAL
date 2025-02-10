import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, inject } from '@angular/core';
import { Feature, Map } from 'ol';
import GeoJSON from 'ol/format/GeoJSON';
import GML2 from 'ol/format/GML2';
import GML3 from 'ol/format/GML3';
import GML32 from 'ol/format/GML32';
import WFS from 'ol/format/WFS';
import { get as getProjection } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { WriteGetFeatureOptions } from 'ol/format/WFS';
import { Observable, Observer, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NolmWfsGetFeatureService {
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  constructor() {}

  fetch(
    map: Map,
    url: string,
    wfsOptions: WriteGetFeatureOptions,
    source: VectorSource | undefined,
    fetchOptions?: any
  ): Observable<Feature[]> {
    const subscription = new Observable((observer: Observer<Feature[]>) => {
      let _wfsOptions = {... wfsOptions};
      if(!_wfsOptions.outputFormat) {
        _wfsOptions = {..._wfsOptions, outputFormat: 'application/json'};
      }
      let srsName = _wfsOptions.srsName || map.getView().getProjection().getCode();
      const proj = getProjection(srsName);
      if(proj !== null && proj.getAxisOrientation() === 'neu') {
        srsName = 'urn:x-ogc:def:crs:' + srsName;
      }
      _wfsOptions.srsName = srsName;

      const featureRequest = new WFS().writeGetFeature(_wfsOptions);
      const postData = new XMLSerializer().serializeToString(featureRequest);
      console.log('WFS GetFeature Request: ');
      console.log(postData);
      const responseType = _wfsOptions.outputFormat === 'application/json' ? 'json' : 'text';
      const _fetchOptions = {...fetchOptions, responseType: responseType};
      
      const observable = this.httpClient
        .post(url, postData, _fetchOptions)
        .pipe(
          catchError((error: any) => {
            console.error('WFS GetFeature Error: ');
            console.error(error);
            return throwError(
              () =>
                new Error('WFS GetFeature Error. See error log for details.')
            );
          })
        )
        .subscribe({
          next: (response: any) => {
            const features = this.parseFeatures(map, response, _wfsOptions, source);
            observer.next(features);
          },
          complete: () => {
            observer.complete();
          },
          error: (error: Error) => {
            observer.error(error);
          },
        });
      this.destroyRef.onDestroy(() => {
        observable.unsubscribe();
      });
    });
    return subscription;
  }

  private parseFeatures(
    map: Map,
    response: any,
    wfsOptions: WriteGetFeatureOptions,
    source: VectorSource | undefined
  ): Feature[] {
    let parser = null;
    let outputFormat = wfsOptions.outputFormat;
    if(outputFormat) outputFormat = outputFormat.toUpperCase();
    switch (outputFormat) {
      case 'APPLICATION/JSON':
        parser = new GeoJSON();
        break;
      case 'GML2':
        parser = new GML2();
        break;
      case 'GML3':
        parser = new GML3();
        break;
      case 'GML32':
        parser = new GML32();
        break;
      default:
        parser = new GML3();
    }
    
    const features = parser.readFeatures(response, {
      dataProjection: wfsOptions.srsName,
      featureProjection: map.getView().getProjection().getCode(),
    });
    //const features = new WFS().readFeatures(response);
    // const features = new WFS().readFeatures(response, {
    //   dataProjection: 'EPSG:31370',
    //   featureProjection: 'EPSG:31370',
    // });
    source && source.addFeatures(features);
    return features;
  }
}