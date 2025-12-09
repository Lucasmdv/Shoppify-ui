import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseCard } from './purchase-card';

describe('PurchaseCard', () => {
  let component: PurchaseCard;
  let fixture: ComponentFixture<PurchaseCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
