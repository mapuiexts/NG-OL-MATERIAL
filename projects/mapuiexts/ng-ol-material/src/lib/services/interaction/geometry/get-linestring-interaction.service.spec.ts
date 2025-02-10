import { TestBed } from '@angular/core/testing';

import { NolmGetLineStringInteractionService } from './get-linestring-interaction.service';

describe('GetLineInteractionService', () => {
  let service: NolmGetLineStringInteractionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NolmGetLineStringInteractionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
