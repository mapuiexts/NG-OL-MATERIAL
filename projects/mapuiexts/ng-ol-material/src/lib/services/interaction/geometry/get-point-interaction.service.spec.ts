import { TestBed } from '@angular/core/testing';

import { GetPointInteractionService } from './get-point-interaction.service';

describe('GetPointInteractionService', () => {
  let service: GetPointInteractionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetPointInteractionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
