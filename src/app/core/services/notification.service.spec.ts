import { TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from './notification.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('NotificationService', () => {
  let service: NotificationService;
  let mockToastrService: Record<string, ReturnType<typeof vi.fn>>;
  let mockTranslateService: { instant: ReturnType<typeof vi.fn>; currentLang: string; defaultLang: string };

  beforeEach(() => {
    mockToastrService = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    };

    mockTranslateService = {
      instant: vi.fn((key: string) => `TRANSLATED_${key}`),
      currentLang: 'pt',
      defaultLang: 'pt',
    };

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: ToastrService, useValue: mockToastrService },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    });

    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should resolve dictionary message in Portuguese when currentLang is pt', () => {
    service.success({ pt: 'Sucesso PT', en: 'Success EN' }, { pt: 'Título PT', en: 'Title EN' });
    expect(mockToastrService.success).toHaveBeenCalledWith('Sucesso PT', 'Título PT');
  });

  it('should resolve dictionary message in English when currentLang is en', () => {
    mockTranslateService.currentLang = 'en';
    service.error({ pt: 'Erro PT', en: 'Error EN' }, { pt: 'Título PT', en: 'Title EN' });
    expect(mockToastrService.error).toHaveBeenCalledWith('Error EN', 'Title EN');
  });

  it('should resolve translation keys using TranslateService instant when argument is a string', () => {
    service.warning('COMMON.WARN_KEY', 'COMMON.TITLE_KEY');
    expect(mockTranslateService.instant).toHaveBeenCalledWith('COMMON.WARN_KEY');
    expect(mockTranslateService.instant).toHaveBeenCalledWith('COMMON.TITLE_KEY');
    expect(mockToastrService.warning).toHaveBeenCalledWith('TRANSLATED_COMMON.WARN_KEY', 'TRANSLATED_COMMON.TITLE_KEY');
  });

  it('should use fallback pt if neither lang exists in dict or currentLang is undefined', () => {
    mockTranslateService.currentLang = '';
    service.info({ pt: 'Info PT', en: 'Info EN' });
    expect(mockToastrService.info).toHaveBeenCalledWith('Info PT', 'Informação');
  });
});
