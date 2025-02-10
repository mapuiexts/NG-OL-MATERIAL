import { DestroyRef, Directive, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { NolmWfsGetFeatureService } from '../../../services/wfs/wfs-get-feature.service'; //
import { Subscription } from 'rxjs';
import { WriteGetFeatureOptions } from 'ol/format/WFS';
import VectorSource from 'ol/source/Vector';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Feature, Map } from 'ol';

export interface NolmWfsGetFeatureOptions {
  map: Map;
  url: string;
  wfsOptions: WriteGetFeatureOptions;
  source?: VectorSource;
  wfsFetchOptions?: any;
}

@Directive({
  selector: '[nolmWfsGetFeature]',
  standalone: true,
  host: {
    '(click)': 'onClick($event)',
    '[disabled]': 'isRunning()',
  },
})
export class NolmWfsGetFeatureDirective {
  @Input({ required: true }) nolmWfsGetFeature!: NolmWfsGetFeatureOptions;
  @Output() onSearch: EventEmitter<Feature[]> = new EventEmitter<Feature[]>();
  @Output() onStart: EventEmitter<void> = new EventEmitter<void>();
  @Output() onError: EventEmitter<Error> = new EventEmitter<Error>();
  private wfsGetFeatureService = inject(NolmWfsGetFeatureService);
  private wfsGetFeatureSubscription?: Subscription;
  private destroyRef = inject(DestroyRef);
  public isRunning = signal(false);
  private infoSnackBar = inject(MatSnackBar);

  //private wfsFetchOptions = undefined;

  constructor() {}

  onClick(): void {
    const map = this.nolmWfsGetFeature.map;
    const url = this.nolmWfsGetFeature.url;
    const wfsOptions = this.nolmWfsGetFeature.wfsOptions;
    const wfsFetchOptions = this.nolmWfsGetFeature.wfsFetchOptions;
    const source = this.nolmWfsGetFeature.source;
    this.isRunning.set(true);
    this.infoSnackBar.open('fetching feature...', undefined, {
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
    this.onStart.emit();
    this.wfsGetFeatureSubscription = this.wfsGetFeatureService
      .fetch(map, url, wfsOptions, source, wfsFetchOptions)
      .subscribe({
        next: (features) => {
          this.onSearch.emit(features);
        },
        complete: () => {
          this.isRunning.set(false);
          this.infoSnackBar.dismiss();
        },
        error: (error: Error) => {
          console.error('WFS GetFeature Error:', error);
          this.isRunning.set(false);
          this.infoSnackBar.dismiss();
          this.onError.emit(error);
        },
      });
    this.destroyRef.onDestroy(() => {
      this.wfsGetFeatureSubscription?.unsubscribe();
    });
  }
}
