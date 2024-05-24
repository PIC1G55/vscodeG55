/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import 'vs/css!./rulersInfo';
import { FastDomNode, createFastDomNode } from 'vs/base/browser/fastDomNode';
import { ViewPart } from 'vs/editor/browser/view/viewPart';
import { RenderingContext, RestrictedRenderingContext } from 'vs/editor/browser/view/renderingContext';
import { ViewContext } from 'vs/editor/common/viewModel/viewContext';
import * as viewEvents from 'vs/editor/common/viewEvents';
import { EditorOption, IRulerOption } from 'vs/editor/common/config/editorOptions';
import { renderFormattedText } from 'vs/base/browser/formattedTextRenderer';

export class RulersInfo extends ViewPart {

	public domNode: FastDomNode<HTMLElement>;
	private _rulers: IRulerOption[];
	private readonly _renderedRulersInfo: FastDomNode<HTMLElement>[];
	private _typicalHalfwidthCharacterWidth: number;
	private _contentLeft: number;

	constructor(context: ViewContext) {
		super(context);
		this.domNode = createFastDomNode<HTMLElement>(document.createElement('div'));
		this.domNode.setAttribute('role', 'presentation');
		this.domNode.setAttribute('aria-hidden', 'true');
		this.domNode.setClassName('view-rulers-info');
		const options = this._context.configuration.options;
		this._rulers = options.get(EditorOption.rulers);
		this._typicalHalfwidthCharacterWidth = options.get(EditorOption.fontInfo).typicalHalfwidthCharacterWidth;
		this._renderedRulersInfo = [];

		const layoutInfo = options.get(EditorOption.layoutInfo);
		this._contentLeft = layoutInfo.contentLeft;
	}

	public override dispose(): void {
		super.dispose();
	}

	// --- begin event handlers

	public override onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean {
		const options = this._context.configuration.options;
		this._rulers = options.get(EditorOption.rulers);
		this._typicalHalfwidthCharacterWidth = options.get(EditorOption.fontInfo).typicalHalfwidthCharacterWidth;
		return true;
	}
	public override onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean {
		return e.scrollHeightChanged;
	}

	public prepareRender(ctx: RenderingContext): void {
	}

	private _ensureColumnInfoCount(): void {
		const currentCount = this._renderedRulersInfo.length;
		const desiredCount = this._rulers.length;

		if (currentCount === desiredCount) {
			// Nothing to do
			return;
		}

		if (currentCount < desiredCount) {
			let addCount = desiredCount - currentCount;
			while (addCount > 0) {
				const node = createFastDomNode<HTMLElement>(
					renderFormattedText(this._rulers[desiredCount - addCount].column.toString())
				);
				node.setClassName('ruler-column');
				node.setWidth('auto');
				this.domNode.appendChild(node);
				this._renderedRulersInfo.push(node);
				addCount--;
			}
			return;
		}

		let removeCount = currentCount - desiredCount;
		while (removeCount > 0) {
			const node = this._renderedRulersInfo.pop()!;
			this.domNode.removeChild(node);
			removeCount--;
		}
	}

	public render(ctx: RestrictedRenderingContext): void {
		this._ensureColumnInfoCount();
		for (let i = 0, len = this._rulers.length; i < len; i++) {
			const node = this._renderedRulersInfo[i];
			const ruler = this._rulers[i];

			node.setColor(ruler.color ? ruler.color : '');
			node.setLeft(this._contentLeft + ruler.column * this._typicalHalfwidthCharacterWidth);
		}
	}
}
