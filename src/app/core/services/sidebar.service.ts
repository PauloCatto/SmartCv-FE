import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  isCollapsed = signal(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  toggle() {
    this.isCollapsed.update(val => !val);
  }

  collapse() {
    this.isCollapsed.set(true);
  }
}
