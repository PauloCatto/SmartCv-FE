import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreativePhotoTemplateComponent } from './creative-photo-template.component';
import { TranslateModule } from '@ngx-translate/core';

describe('CreativePhotoTemplateComponent', () => {
  let component: CreativePhotoTemplateComponent;
  let fixture: ComponentFixture<CreativePhotoTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreativePhotoTemplateComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreativePhotoTemplateComponent);
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
