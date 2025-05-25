import { HttpClient, HttpParams } from '@angular/common/http';
import { DestroyRef, Injectable, inject } from '@angular/core';
import { Observable, Observer, catchError, throwError } from 'rxjs';
import { type NolmWfsDescribeFeatureTypeRequestOptions } from './wfs-describe-feature-type-request.model';


@Injectable({
  providedIn: 'root',
})
export class NolmWfsDescribeFeatureTypeService {
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  constructor() {}

  public fetch(
    url: string,
    wfsOptions: NolmWfsDescribeFeatureTypeRequestOptions,
    fetchOptions?: any
  ): Observable<any> {
    const subscription = new Observable((observer: Observer<any>) => {
      const httpParams = this.buildParams(wfsOptions);
      const responseType = 'json';
      const observable = this.httpClient
        .get(url, { ...fetchOptions, params: httpParams, responseType })
        .pipe(
          catchError((error: any) => {
            console.error('WFS DescribeFeatureType Error: ', error);
            return throwError(
              () =>
                new Error(
                  'WFS DescribeFeatureType Error. See error log for details.'
                )
            );
          })
        )
        .subscribe({
          next: (response: any) => {
            observer.next(response);
          },
          error: (error: Error) => {
            observer.error(error);
          },
          complete: () => {
            observer.complete();
          },
        });

      this.destroyRef.onDestroy(() => {
        observable.unsubscribe();
      });
    });

    return subscription;
  }

  private buildParams(
    wfsOptions: NolmWfsDescribeFeatureTypeRequestOptions
  ): HttpParams {
    const _wfsOptions: any = {
      ...wfsOptions,
      service: 'WFS',
      request: 'DescribeFeatureType',
      outputFormat: 'application/json',
      typeNames: wfsOptions.typeNames.toString(),
      version: wfsOptions.version || '1.1.0',
    };
    if (_wfsOptions.version <= '1.1.0') {
      _wfsOptions.typeName = _wfsOptions.typeNames;
      delete _wfsOptions.typeNames;
    }
    let httpParams = new HttpParams();
    Object.keys(_wfsOptions).forEach((key) => {
      if (_wfsOptions.hasOwnProperty(key)) {
        httpParams = httpParams.set(key, _wfsOptions[key]);
      }
    });
    return httpParams;
  }
}