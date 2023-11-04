import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Event, NavigationEnd, Router } from '@angular/router';
import { Observable, filter, map } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    currPath$: Observable<string>;

    constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, router: Router) {
        this.currPath$ = router.events.pipe(
            filter((e: Event) => e instanceof NavigationEnd),
            map((v: NavigationEnd) => v.urlAfterRedirects.replace('/', ''))
        );
        iconRegistry.addSvgIcon('github', sanitizer.bypassSecurityTrustResourceUrl('assets/img/github-mark.svg'));
    }
}
