import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CredentialsForm } from './credentials-form';

describe('CredentialsForm', () => {
  let component: CredentialsForm;
  let fixture: ComponentFixture<CredentialsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CredentialsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CredentialsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
