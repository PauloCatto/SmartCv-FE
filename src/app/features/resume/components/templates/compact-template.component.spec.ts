import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompactTemplateComponent } from './compact-template.component';
import { TranslateModule } from '@ngx-translate/core';

describe('CompactTemplateComponent', () => {
  let component: CompactTemplateComponent;
  let fixture: ComponentFixture<CompactTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompactTemplateComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompactTemplateComponent);
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
