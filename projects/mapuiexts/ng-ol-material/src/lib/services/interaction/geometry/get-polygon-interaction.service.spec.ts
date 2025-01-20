import { TestBed } from '@angular/core/testing';

import { GetPolygonInteractionService } from './get-polygon-interaction.service';

describe('GetPolygonInteractionService', () => {
  let service: GetPolygonInteractionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetPolygonInteractionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
