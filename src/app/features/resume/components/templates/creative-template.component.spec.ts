import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreativeTemplateComponent } from './creative-template.component';
import { TranslateModule } from '@ngx-translate/core';

describe('CreativeTemplateComponent', () => {
  let component: CreativeTemplateComponent;
  let fixture: ComponentFixture<CreativeTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreativeTemplateComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreativeTemplateComponent);
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
