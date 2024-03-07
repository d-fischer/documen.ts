import type { ReferenceComment, ReferenceCommentTag } from '../../common/reference';
import { DocCommentTag } from './DocCommentTag';

export class DocComment {
	static parse(str: string): DocComment {
		const lines = str
			.replace(/^\s*\/\*+/, '')
			.replace(/\*+\/\s*$/, '')
			.split(/\r\n?|\n/);

		let shortText = undefined;
		let text = undefined;

		let currentTagName: string | undefined = undefined;
		let currentTagRelatedName: string | undefined = undefined;
		let currentTagText: string | undefined = undefined;
		let isInCodeBlock = false;
		let hasAnyShortText = false;
		let shortTextFinished = false;

		const tags: DocCommentTag[] = [];

		for (const line of lines) {
			const cleanedLine = line.replace(/^\s*\*? ?/, '').trimEnd();

			if (/^\s*```(?!.*```)/.test(cleanedLine)) {
				isInCodeBlock = !isInCodeBlock;
			}

			if (!isInCodeBlock) {
				const tagMatch = /^\s*@(\w+)(.*)$/.exec(cleanedLine);
				if (tagMatch) {
					if (currentTagName) {
						tags.push(new DocCommentTag(currentTagName, currentTagRelatedName, currentTagText));
					}
					let [, tagName, tagText] = tagMatch;
					tagText = tagText.trimStart();
					if (tagName === 'param') {
						const param = /^[^\s]+/.exec(tagText);
						if (param) {
							[currentTagRelatedName] = param;
							tagText = tagText.substr(currentTagRelatedName.length + 1).trimStart();
						}
					}
					currentTagName = tagName;
					currentTagText = tagText || undefined;
					continue;
				}
			}

			if (currentTagText !== undefined) {
				currentTagText += `\n${cleanedLine}`;
			} else if (cleanedLine === '' && !shortTextFinished) {
				if (hasAnyShortText) {
					shortTextFinished = true;
				}
			} else if (shortTextFinished) {
				text = text === undefined ? cleanedLine : `${text}\n${cleanedLine}`;
			} else {
				shortText = shortText === undefined ? cleanedLine : `${shortText}\n${cleanedLine}`;
				hasAnyShortText = true;
			}
		}

		if (currentTagName) {
			tags.push(new DocCommentTag(currentTagName, currentTagRelatedName, currentTagText?.trimEnd()));
		}

		return new DocComment(shortText?.trimEnd(), text?.trimEnd(), tags);
	}

	constructor(
		private readonly _shortText?: string,
		private readonly _text?: string,
		private readonly _tags?: DocCommentTag[]
	) {}

	get shortText() {
		return this._shortText;
	}

	get text() {
		return this._text;
	}

	get tags(): readonly DocCommentTag[] | undefined {
		return this._tags;
	}

	consumeTags(predicate: (tag: DocCommentTag) => boolean, action?: (tag: DocCommentTag) => void) {
		if (!this._tags) {
			return;
		}
		const indexesToDelete: number[] = [];
		this._tags.forEach((tag, i) => {
			if (predicate(tag)) {
				action?.(tag);
				indexesToDelete.push(i);
			}
		});

		for (const delIndex of indexesToDelete.reverse()) {
			this._tags.splice(delIndex, 1);
		}
	}

	serialize(): ReferenceComment {
		return {
			shortText: this._shortText,
			text: this._text,
			tags: this._tags?.map(
				(tag): ReferenceCommentTag => ({
					tag: tag.name,
					text: tag.text,
					param: tag.relatedName
				})
			)
		};
	}
}
