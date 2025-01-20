import { TestBed } from '@angular/core/testing';

import { GetLineInteractionService } from './get-line-interaction.service';

describe('GetLineInteractionService', () => {
  let service: GetLineInteractionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetLineInteractionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
