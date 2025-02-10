import { TestBed } from '@angular/core/testing';

import { GetBboxInteractionService } from './get-bbox-interaction.service';

describe('GetBboxInteractionService', () => {
  let service: GetBboxInteractionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetBboxInteractionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
