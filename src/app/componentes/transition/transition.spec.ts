import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Transition } from './transition';

describe('Transition', () => {
  let component: Transition;
  let fixture: ComponentFixture<Transition>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Transition],
    }).compileComponents();

    fixture = TestBed.createComponent(Transition);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
