import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModernTemplateComponent } from './modern-template.component';
import { TranslateModule } from '@ngx-translate/core';

describe('ModernTemplateComponent', () => {
  let component: ModernTemplateComponent;
  let fixture: ComponentFixture<ModernTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModernTemplateComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModernTemplateComponent);
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
