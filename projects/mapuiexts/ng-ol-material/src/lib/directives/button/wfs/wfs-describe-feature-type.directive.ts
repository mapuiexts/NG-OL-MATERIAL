
import {
  DestroyRef,
  Directive,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import { NolmWfsDescribeFeatureTypeService } from '../../../services/wfs/wfs-describe-feature-type.service';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { type NolmWfsDescribeFeatureTypeOptions} from './wfs-describe-feature-type.model';



@Directive({
  selector: '[nolmWfsDescribeFeatureType]',
  standalone: true,
  host: {
    '(click)': 'onClick()',
    '[disabled]': 'isRunning()',
  },
})
export class NolmWfsDescribeFeatureTypeDirective {
  @Input({ required: true }) nolmWfsDescribeFeatureType!: NolmWfsDescribeFeatureTypeOptions;
  @Output() onStart: EventEmitter<void> = new EventEmitter<void>();
  @Output() onFetch: EventEmitter<any> = new EventEmitter<any>();
  @Output() onError: EventEmitter<Error> = new EventEmitter<Error>();

  private isRunning = signal(false);
  private wfsDescribeFeatureTypeService = inject(
    NolmWfsDescribeFeatureTypeService
  );
  private wfsDescribeFeatureTypeSubscription?: Subscription;
  private destroyRef = inject(DestroyRef);
  private infoSnackBar = inject(MatSnackBar);

  constructor() {}

  onClick() {
    const url = this.nolmWfsDescribeFeatureType.url;
    const wfsOptions = this.nolmWfsDescribeFeatureType.wfsOptions;
    const wfsFetchOptions = this.nolmWfsDescribeFeatureType.wfsFetchOptions;
    this.isRunning.set(true);
    this.infoSnackBar.open('fetching feature...', undefined, {
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
    this.onStart.emit();
    this.wfsDescribeFeatureTypeSubscription = this.wfsDescribeFeatureTypeService
      .fetch(url, wfsOptions, wfsFetchOptions)
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.onFetch.emit(response);
        },
        error: (error: Error) => {
          console.error('WFS DescribeFeatureType Error: ', error);
          this.infoSnackBar.dismiss();
          this.onError.emit(error);
          this.isRunning.set(false);
        },
        complete: () => {
          console.log('WFS DescribeFeatureType Complete');
          this.infoSnackBar.dismiss();
          this.isRunning.set(false);
        },
      });
    this.destroyRef.onDestroy(() => {
      this.wfsDescribeFeatureTypeSubscription?.unsubscribe();
    });
  }
}
