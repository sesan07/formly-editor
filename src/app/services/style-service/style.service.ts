import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class StyleService {

	public classNames: string[] = [];
	private readonly _selectorRegexp = /\.-?[_a-zA-Z]+[\w-]*/g;

	constructor(private _http: HttpClient) {
		this._http.get('assets/custom-styles.css', { responseType: 'text' }).subscribe((response) => {
			this.classNames.push(...this._getClassNames(response));
		});
	}

	private _getClassNames(text: string): string[] {
		const doc: Document = document.implementation.createHTMLDocument('');
		const styleElement: HTMLStyleElement = document.createElement('style');
		styleElement.textContent = text;
		doc.body.appendChild(styleElement);

		const classNameSet: Set<string> = new Set();
		const cssRules: CSSRuleList = styleElement.sheet.cssRules;
		Array.from(cssRules).forEach((rule: CSSStyleRule) => {
			const matchedSelectors: string[] = rule.selectorText.match(this._selectorRegexp);
			matchedSelectors.forEach(selector => {
				classNameSet.add(selector.replace(/^\./, ''));  // remove '.' prefix before adding
			});
		});

		return Array.from(classNameSet).sort();
	}
}
