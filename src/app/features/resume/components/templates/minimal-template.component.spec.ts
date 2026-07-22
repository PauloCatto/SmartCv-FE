import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MinimalTemplateComponent } from './minimal-template.component';
import { TranslateModule } from '@ngx-translate/core';

describe('MinimalTemplateComponent', () => {
  let component: MinimalTemplateComponent;
  let fixture: ComponentFixture<MinimalTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinimalTemplateComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MinimalTemplateComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('resume', {
      personalInfo: {},
      experience: [],
      education: [],
      skills: [],
      languages: []
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
