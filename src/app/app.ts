import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class App {
  private translate = inject(TranslateService);

  constructor() {
    this.translate.addLangs(['pt', 'en']);
    this.translate.setDefaultLang('pt');

    const savedLang = localStorage.getItem('smartcv_lang');
    this.translate.use(savedLang || 'pt');
  }
}
