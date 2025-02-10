import { TestBed } from '@angular/core/testing';

import { WmsGetFeatureInfoService } from './wms-get-feature-info.service';

describe('WmsGetFeatureInfoService', () => {
  let service: WmsGetFeatureInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WmsGetFeatureInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
