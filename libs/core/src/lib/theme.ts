import { InjectionToken, WritableSignal } from '@angular/core';

export const CORE_THEME = new InjectionToken<WritableSignal<'light' | 'dark'>>('CODE_EDITOR_THEME');
