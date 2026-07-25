import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

export type I18nMessage = string | { pt: string; en: string };

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private toastr = inject(ToastrService);
  private translate = inject(TranslateService);

  success(message: I18nMessage, title: I18nMessage = { pt: 'Sucesso', en: 'Success' }): void {
    this.toastr.success(this.resolve(message), this.resolve(title));
  }

  error(message: I18nMessage, title: I18nMessage = { pt: 'Erro', en: 'Error' }): void {
    this.toastr.error(this.resolve(message), this.resolve(title));
  }

  warning(message: I18nMessage, title: I18nMessage = { pt: 'Atenção', en: 'Warning' }): void {
    this.toastr.warning(this.resolve(message), this.resolve(title));
  }

  info(message: I18nMessage, title: I18nMessage = { pt: 'Informação', en: 'Info' }): void {
    this.toastr.info(this.resolve(message), this.resolve(title));
  }

  private resolve(content: I18nMessage): string {
    if (typeof content === 'string') {
      return this.translate.instant(content);
    }
    const lang = (this.translate.currentLang || this.translate.defaultLang || 'pt') as 'pt' | 'en';
    return content[lang] ?? content['pt'] ?? '';
  }
}
