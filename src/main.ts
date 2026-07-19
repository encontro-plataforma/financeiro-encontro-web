import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Inicialização do sistemna
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
