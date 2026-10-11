import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Injector, runInInjectionContext } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { CoreResponsiveService } from './core-responsive.service';

describe('CoreResponsiveService', () => {
  let breakpointSubjects: Subject<BreakpointState>[];

  beforeEach(() => {
    breakpointSubjects = [];
    const testBed = getTestBed();
    testBed.configureTestingModule({
      providers: [
        CoreResponsiveService,
        {
          provide: BreakpointObserver,
          useValue: {
            observe: () => {
              const subject = new Subject<BreakpointState>();
              breakpointSubjects.push(subject);
              return subject.asObservable();
            },
          },
        },
      ],
    });
  });

  it('exposes independent mobile, tablet, and desktop breakpoint signals', () => {
    let service!: CoreResponsiveService;
    const injector = TestBed.inject(Injector);

    runInInjectionContext(injector, () => {
      service = TestBed.inject(CoreResponsiveService);
    });

    expect(service.isMobile()).toBe(false);
    expect(service.isTablet()).toBe(false);
    expect(service.isDesktop()).toBe(false);
    expect(breakpointSubjects).toHaveLength(3);

    breakpointSubjects[0].next({ matches: true, breakpoints: {} });
    expect(service.isMobile()).toBe(true);
    expect(service.isTablet()).toBe(false);
    expect(service.isDesktop()).toBe(false);

    breakpointSubjects[0].next({ matches: false, breakpoints: {} });
    breakpointSubjects[1].next({ matches: true, breakpoints: {} });
    expect(service.isMobile()).toBe(false);
    expect(service.isTablet()).toBe(true);
    expect(service.isDesktop()).toBe(false);

    breakpointSubjects[1].next({ matches: false, breakpoints: {} });
    breakpointSubjects[2].next({ matches: true, breakpoints: {} });
    expect(service.isMobile()).toBe(false);
    expect(service.isTablet()).toBe(false);
    expect(service.isDesktop()).toBe(true);
  });
});
