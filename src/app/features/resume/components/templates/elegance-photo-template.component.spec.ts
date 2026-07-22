import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElegancePhotoTemplateComponent } from './elegance-photo-template.component';
import { TranslateModule } from '@ngx-translate/core';

describe('ElegancePhotoTemplateComponent', () => {
  let component: ElegancePhotoTemplateComponent;
  let fixture: ComponentFixture<ElegancePhotoTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElegancePhotoTemplateComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElegancePhotoTemplateComponent);
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
