import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BreakpointType, ContainerClassPrefix, ContainerType } from './style.types';

@Injectable({
    providedIn: 'root',
})
export class StyleService {

	private readonly _selectorRegexp = /\.-?[_a-zA-Z]+[\w-]*/g;
	private _allClassNames: string[] = [];
    private _containerClassNames: string[];
    private _generalClassNames: string[];
    private _breakpointClassNamesMap: Map<BreakpointType, string[]> = new Map();

	constructor(private _http: HttpClient) {
        this._setupClassNames();
	}

    public getAllClassNames(): string[] {
        return this._allClassNames;
    }

    public getBreakpointClassNames(breakpointType?: BreakpointType): string[] {
        return breakpointType ? this._breakpointClassNamesMap.get(breakpointType) : this._generalClassNames;
    }

    public getContainerClassNames(): string[] {
        return this._containerClassNames;
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
			this._allClassNames.push(...this._parseClassNames(response));

            const containers: string[] = Object.values(ContainerType);
            const prefixes: string[] = Object.values(ContainerClassPrefix);
            const breakpoints: string[] = Object.values(BreakpointType);

            // Container classes
            this._containerClassNames = this._allClassNames.filter(className =>
                prefixes.some(prefix => className.startsWith(prefix))
            ).concat(containers);

            // Breakpoint classes
            const validBreakpointClassNames: string[] = this._allClassNames.filter(className =>
                !prefixes.some(prefix => className.startsWith(prefix))
                && !containers.includes(className)
            );

            this._generalClassNames = validBreakpointClassNames.filter(className =>
                !breakpoints.some(breakpoint => className.endsWith(breakpoint))
            );
            breakpoints.forEach(breakpoint => {
                this._breakpointClassNamesMap.set(
                    breakpoint as BreakpointType,
                    validBreakpointClassNames.filter(className => className.endsWith(breakpoint))
                );
            });

		});
    }
}
