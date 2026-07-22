import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EleganceTemplateComponent } from './elegance-template.component';
import { TranslateModule } from '@ngx-translate/core';

describe('EleganceTemplateComponent', () => {
  let component: EleganceTemplateComponent;
  let fixture: ComponentFixture<EleganceTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EleganceTemplateComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EleganceTemplateComponent);
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
