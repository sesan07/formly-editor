import { bootstrapApplication } from '@angular/platform-browser';
import { enableDragDropTouch } from '@dragdroptouch/drag-drop-touch';
import { App } from './app/app';
import { appConfig } from './app/app.config';

if (typeof window !== 'undefined') {
  enableDragDropTouch(undefined, undefined, {
    isPressHoldMode: true,
    pressHoldDelayMS: 350,
  });
}

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
