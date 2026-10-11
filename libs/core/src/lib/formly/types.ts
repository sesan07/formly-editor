import { InjectionToken, WritableSignal } from '@angular/core';

export const CORE_BUILDER_FORM = new InjectionToken<WritableSignal<boolean>>('CoreBuilderForm');
