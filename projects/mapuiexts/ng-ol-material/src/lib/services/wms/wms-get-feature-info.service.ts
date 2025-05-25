import {
  HttpClient,
  HttpContext,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { Observable, Observer, catchError, throwError, of } from 'rxjs';
import { Feature, Map } from 'ol';
import { Layer } from 'ol/layer';
import GeoJSON, { GeoJSONFeatureCollection } from 'ol/format/GeoJSON';
import { Coordinate } from 'ol/coordinate';

//import BaseLayer from 'ol/layer/Base';

type NolmHttpOptions =
  | {
      headers?:
        | HttpHeaders
        | {
            [header: string]: string | string[];
          };
      context?: HttpContext;
      observe?: 'body';
      params?:
        | HttpParams
        | {
            [param: string]:
              | string
              | number
              | boolean
              | ReadonlyArray<string | number | boolean>;
          };
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
      transferCache?:
        | {
            includeHeaders?: string[];
          }
        | boolean;
    }
  | undefined;

export interface NolmWmsGetFeatureInfoResult {
  feature: Feature;
  layer: Layer;
}

@Injectable({
  providedIn: 'root',
})
export class NolmWmsGetFeatureInfoService {
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  constructor() {}

  fetch(
    map: Map,
    layers: Layer[],
    coordinate: Coordinate,
    options: NolmHttpOptions = undefined
  ): Observable<NolmWmsGetFeatureInfoResult> {
    const subscription = new Observable((observer: Observer<NolmWmsGetFeatureInfoResult>) => {
      const projCode = map.getView().getProjection().getCode();
      const filteredLayers = layers.filter((layer) => {
        const source = layer.getSource();
        if ((source as any).getFeatureInfoUrl) {
          return true;
        }
        return false;
      });
      let numberOfRequests = filteredLayers.length;
      let currentNumberOfResponses = 0;
      const errors: any = [];
      filteredLayers.forEach((layerItem) => {
        const source = layerItem.getSource();
        const url = (source as any).getFeatureInfoUrl(
          coordinate,
          map.getView().getResolution(),
          projCode,
          {
            INFO_FORMAT: 'application/json',
          }
        );
        if (url) {
          const observable = this.httpClient
            .get<GeoJSONFeatureCollection>(
              url,
              options /*{...options, observe: 'response'}*/
            )
            .pipe(
              catchError((error) => {
                //ignore error
                console.error('Error:', error);
                errors.push(error);
                return of(undefined);
                // return throwError(
                //   () => new Error(`Error fetching feature info from ${url}`)
                // );
              })
            )
            .subscribe({
              next: (resData) => {
                if (resData) {
                  const format = new GeoJSON();
                  const features: Feature[] = format.readFeatures(resData);
                  features.forEach((feature) => {
                    observer.next({feature: feature, layer: layerItem});
                  });
                }
                currentNumberOfResponses++;
              },
              //never happens, error will be ignored in catchError
              error: (error) => {
                errors.push(error);
                currentNumberOfResponses++;
                observer.error(error);
              },
              complete: () => {
                if (currentNumberOfResponses === numberOfRequests) {
                  if (errors.length > 0) {
                    observer.error(errors);
                  } else {
                    observer.complete();
                  }
                }
              },
            });
          this.destroyRef.onDestroy(() => {
            observable.unsubscribe();
          });
        }
      });

      const unsubscribe = () => {};

      return {
        unsubscribe: unsubscribe,
      };
    });
    return subscription;
  }
}
