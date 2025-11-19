import { TestBed } from '@angular/core/testing';

import { CreateCategory } from './create-category';

describe('CreateCategory', () => {
  let service: CreateCategory;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateCategory);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
