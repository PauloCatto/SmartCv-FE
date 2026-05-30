import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumeForm } from './resume-form';

describe('ResumeForm', () => {
  let component: ResumeForm;
  let fixture: ComponentFixture<ResumeForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumeForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumeForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
