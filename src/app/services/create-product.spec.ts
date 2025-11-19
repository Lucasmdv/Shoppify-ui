import { TestBed } from '@angular/core/testing';

import { CreateProduct } from './create-product';

describe('CreateProduct', () => {
  let service: CreateProduct;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateProduct);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
