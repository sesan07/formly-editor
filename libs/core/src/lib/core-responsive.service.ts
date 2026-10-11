import { BreakpointObserver } from '@angular/cdk/layout';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

const MOBILE_BREAKPOINT = '(max-width: 1023.98px)';
const TABLET_BREAKPOINT = '(min-width: 1024px) and (max-width: 1535.98px)';
const DESKTOP_BREAKPOINT = '(min-width: 1536px)';

@Injectable({
  providedIn: 'root',
})
export class CoreResponsiveService {
  private readonly breakpointObserver = inject(BreakpointObserver);

  private readonly isMobile$ = this.breakpointObserver
    .observe([MOBILE_BREAKPOINT])
    .pipe(map((result) => result.matches));

  private readonly isTablet$ = this.breakpointObserver
    .observe([TABLET_BREAKPOINT])
    .pipe(map((result) => result.matches));

  private readonly isDesktop$ = this.breakpointObserver
    .observe([DESKTOP_BREAKPOINT])
    .pipe(map((result) => result.matches));

  readonly isMobile = toSignal(this.isMobile$, { initialValue: false });
  readonly isTablet = toSignal(this.isTablet$, { initialValue: false });
  readonly isDesktop = toSignal(this.isDesktop$, { initialValue: false });
}
