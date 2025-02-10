import { TestBed } from '@angular/core/testing';

import { WfsGetFeatureService } from './wfs-get-feature.service';

describe('WfsGetFeatureService', () => {
  let service: WfsGetFeatureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WfsGetFeatureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
