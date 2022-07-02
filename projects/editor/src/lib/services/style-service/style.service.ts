import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BreakpointType, ContainerClassPrefix, ContainerType } from './style.types';

@Injectable({
    providedIn: 'root',
})
export class StyleService {
    public get allClassNames$(): Observable<string[]> {
        return this._allClassNames$.asObservable();
    }
    public get containerClassNames$(): Observable<string[]> {
        return this._containerClassNames$.asObservable();
    }
    public get generalClassNames$(): Observable<string[]> {
        return this._generalClassNames$.asObservable();
    }

	private readonly _selectorRegexp = /\.-?[_a-zA-Z]+[\w-]*/g;
	private _allClassNames$: BehaviorSubject<string[]> = new BehaviorSubject([]);
    private _containerClassNames$: BehaviorSubject<string[]> = new BehaviorSubject([]);
    private _generalClassNames$: BehaviorSubject<string[]> = new BehaviorSubject([]);
    private _breakpointClassNamesMap: Map<BreakpointType, BehaviorSubject<string[]>> = new Map();

	constructor(private _http: HttpClient) {
        // Populate breakpoint map
        Object.values(BreakpointType).forEach(breakpoint => {
            this._breakpointClassNamesMap.set(breakpoint, new BehaviorSubject([]));
        })

        // Set up
        this._setupClassNames();
	}

    public getBreakpointClassNames(breakpointType?: BreakpointType): Observable<string[]> {
        return breakpointType ? this._breakpointClassNamesMap.get(breakpointType) : this._generalClassNames$;
    }

    private _getStyleRuleClassNames(rule: CSSStyleRule): string[] {
        return rule.selectorText
            .match(this._selectorRegexp)
            .map(selector => selector.replace(/^\./, '')); // remove '.' prefix
    }

	private _parseClassNames(text: string): string[] {
		const doc: Document = document.implementation.createHTMLDocument('');
		const styleElement: HTMLStyleElement = document.createElement('style');
		styleElement.textContent = text;
		doc.body.appendChild(styleElement);

		const classNameSet: Set<string> = new Set();
		const cssRules: CSSRuleList = styleElement.sheet.cssRules;
		Array.from(cssRules).forEach((rule: CSSRule) => {
            if (rule instanceof CSSStyleRule) {
                this._getStyleRuleClassNames(rule).forEach(className => classNameSet.add(className));
            } else if (rule instanceof CSSMediaRule) {
                Array.from(rule.cssRules).forEach(styleRule =>
                    this._getStyleRuleClassNames(styleRule as CSSStyleRule).forEach(className => classNameSet.add(className))
                );
            }
		});

		return Array.from(classNameSet).sort();
	}

    private _setupClassNames(): void {
		this._http.get('assets/custom-styles.css', { responseType: 'text' }).subscribe((response) => {
            const containers: string[] = Object.values(ContainerType);
            const prefixes: string[] = Object.values(ContainerClassPrefix);
            const breakpoints: string[] = Object.values(BreakpointType);

            const allClassNames = this._parseClassNames(response);

            // Container classes
            const containerClassNames = allClassNames
                .filter(className =>
                    prefixes.some(prefix => className.startsWith(prefix))
                )
                .concat(containers);

            // Breakpoint classes
            const validBreakpointClassNames: string[] = allClassNames
                .filter(className =>
                    !prefixes.some(prefix => className.startsWith(prefix))
                    && !containers.includes(className)
                );

            const generalClassNames = validBreakpointClassNames
                .filter(className =>
                    !breakpoints.some(breakpoint => className.endsWith(breakpoint))
                );
            
            breakpoints.forEach(breakpoint => {
                const breakpointClasses: string[] = validBreakpointClassNames
                    .filter(className =>
                        className.endsWith(breakpoint)
                    )

                this._breakpointClassNamesMap.get(breakpoint as BreakpointType).next(breakpointClasses);
            });

			this._allClassNames$.next(allClassNames);
            this._containerClassNames$.next(containerClassNames);
            this._generalClassNames$.next(generalClassNames);
		});
    }
}
