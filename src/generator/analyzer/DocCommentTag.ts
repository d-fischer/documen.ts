export class DocCommentTag {
	readonly name;

	constructor(name: string, public readonly relatedName?: string, public readonly text?: string) {
		this.name = name.toLowerCase();
	}
}
