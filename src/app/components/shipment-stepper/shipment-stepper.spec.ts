import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentStepper } from './shipment-stepper';

describe('ShipmentStepper', () => {
  let component: ShipmentStepper;
  let fixture: ComponentFixture<ShipmentStepper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipmentStepper]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipmentStepper);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
