import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BreakpointType, ContainerType, FlexContainerPrefix, GridChildPrefix, GridContainerPrefix } from './style.types';

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
    // All classes
	private _allClassNames$: BehaviorSubject<string[]> = new BehaviorSubject([]);
    // Classes that start with a container prefix. And the containers ('flex' and 'grid')
    private _containerClassNames$: BehaviorSubject<string[]> = new BehaviorSubject([]);
    // Classes that aren't container or breakpoint classes
    private _generalClassNames$: BehaviorSubject<string[]> = new BehaviorSubject([]);
    // Non container classes for each breakpoint
    private _breakpointClassNamesMap: Map<BreakpointType, BehaviorSubject<string[]>> = new Map();

	constructor(private _http: HttpClient) {
        // Populate breakpoint map
        Object.values(BreakpointType).forEach(breakpoint => {
            this._breakpointClassNamesMap.set(breakpoint, new BehaviorSubject([]));
        })

        this._setupClassNames();
	}

    public getBreakpointClassNames(breakpointType?: BreakpointType): Observable<string[]> {
        return breakpointType ? this._breakpointClassNamesMap.get(breakpointType) : this._generalClassNames$;
    }

    private _setupClassNames(): void {
		this._http.get('assets/custom-styles.css', { responseType: 'text' }).subscribe((response) => {
            const containers: string[] = Object.values(ContainerType);
            // Prefixes for container related classes
            const containerPrefixes: string[] = [
                ...Object.values(GridContainerPrefix), 
                ...Object.values(GridChildPrefix), 
                ...Object.values(FlexContainerPrefix)
            ]
            const breakpoints: string[] = Object.values(BreakpointType);

            const allClasses: string[] = this._parseClassNames(response);

            // Classes that start with a container prefix. And the containers ('flex' and 'grid')
            const containerClasses: string[] = [...containers]
            const nonContainerClasses: string[] = []
            allClasses.forEach(className => {
                // If className starts with a container prefix
                if (containerPrefixes.some(prefix => className.startsWith(prefix))) {
                    containerClasses.push(className);
                } else if (!containers.includes(className)) {
                    nonContainerClasses.push(className);
                }
            })
            
            // Non container classes for each breakpoint
            breakpoints.forEach(breakpoint => {
                const breakpointClasses: string[] = nonContainerClasses
                    .filter(className =>
                        className.endsWith(breakpoint)
                    )

                this._breakpointClassNamesMap.get(breakpoint as BreakpointType).next(breakpointClasses);
            });

            // Classes that aren't container or breakpoint classes
            const generalClasses = nonContainerClasses
                .filter(className =>
                    !breakpoints.some(breakpoint => className.endsWith(breakpoint))
                );

			this._allClassNames$.next(allClasses);
            this._containerClassNames$.next(containerClasses);
            this._generalClassNames$.next(generalClasses);
		});
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

    private _getStyleRuleClassNames(rule: CSSStyleRule): string[] {
        return rule.selectorText
            .match(this._selectorRegexp)
            .map(selector => selector.replace(/^\./, '')); // remove '.' prefix
    }
}
