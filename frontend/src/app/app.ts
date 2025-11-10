import { Component } from '@angular/core';
import { WebInspectorComponent } from './components/web-inspector.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WebInspectorComponent],
  template: '<app-web-inspector></app-web-inspector>'
})
export class AppComponent {
  title = 'Web Inspector';
}

