interface ReferenceFlags {
	isExported: boolean;
	isOptional: boolean;
}

interface ReferenceGroup {
	title: string;
	kind: number;
	children: number[];
}

interface ReferenceCommentTag {
	tag: string;
	text: string;
}

interface ReferenceComment {
	shortText?: string;
	text?: string;
	tags?: ReferenceCommentTag[];
}

interface ReferenceSource {
	fileName: string;
	line: number;
	character: number;
}

export interface ReferenceType {
	type: string;
	types: ReferenceType[];
	name: string;
	id?: string;
	typeArguments?: ReferenceType[];
	elementType?: ReferenceType;
}

export enum ReferenceNodeKind {
	Global = 0,
	ExternalModule = 1,
	Module = 2,
	Enum = 4,
	EnumMember = 16,
	Variable = 32,
	Function = 64,
	Class = 128,
	Interface = 256,
	Constructor = 512,
	Property = 1024,
	Method = 2048,
	CallSignature = 4096,
	IndexSignature = 8192,
	ConstructorSignature = 16384,
	Parameter = 32768,
	TypeLiteral = 65536,
	TypeParameter = 131072,
	Accessor = 262144,
	GetSignature = 524288,
	SetSignature = 1048576,
	ObjectLiteral = 2097152,
	TypeAlias = 4194304,
	Event = 8388608
}

export interface ReferenceNode {
	id: number;
	name: string;
	kind: ReferenceNodeKind;
	comment?: ReferenceComment;
	kindString?: string;
	sources?: ReferenceSource[];
	defaultValue?: string;
	flags: ReferenceFlags;
	children: ReferenceNode[];
	signatures?: ReferenceSignatureNode[];
	getSignature?: ReferenceSignatureNode[];
	groups: ReferenceGroup[];
	type?: ReferenceType;
}

export interface ReferenceSignatureNode extends ReferenceNode {
	parameters: ReferenceNode[];
}

import * as data from './reference.json';

export default data as ReferenceNode;
