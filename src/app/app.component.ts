import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon, MatIconRegistry } from '@angular/material/icon';
import { MatSelect } from '@angular/material/select';
import { DomSanitizer } from '@angular/platform-browser';
import { Event, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Observable, filter, map } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [MatFormField, MatLabel, MatSelect, MatOption, RouterLink, MatIcon, RouterOutlet, AsyncPipe],
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
