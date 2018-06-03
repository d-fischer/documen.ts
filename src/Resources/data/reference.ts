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

export interface IntrinsicReferenceType {
	type: 'intrinsic';
	name: string;
}

export interface ReferenceReferenceType {
	type: 'reference';
	name: string;
	id: string;
	typeArguments?: ReferenceType[];
}

export interface ArrayReferenceType {
	type: 'array';
	elementType?: ReferenceType;
}

export interface UnionReferenceType {
	type: 'union';
	types: ReferenceType[];
}

export interface StringLiteralReferenceType {
	type: 'stringLiteral';
	value: string;
}

export type ReferenceType = IntrinsicReferenceType | ReferenceReferenceType | ArrayReferenceType | UnionReferenceType | StringLiteralReferenceType;

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

export interface AbstractReferenceNode {
	id: number;
	name: string;
	kind: ReferenceNodeKind;
	kindString: string;
	comment?: ReferenceComment;
	sources: ReferenceSource[];
	flags: ReferenceFlags;
	defaultValue?: string;
	children: ReferenceNode[];
	groups: ReferenceGroup[];
	type?: ReferenceType;
}

export interface ClassReferenceNode extends AbstractReferenceNode {
	kind: ReferenceNodeKind.Class;
}

export interface SignatureReferenceNode extends AbstractReferenceNode {
	parameters?: ReferenceNode[];
}

export interface PropertyReferenceNode extends AbstractReferenceNode {
	kind: ReferenceNodeKind.Property;
}

export interface GetSignatureReferenceNode extends AbstractReferenceNode {
	parameters?: ReferenceNode[];
}

export interface MethodReferenceNode extends AbstractReferenceNode {
	kind: ReferenceNodeKind.Method;
	signatures?: SignatureReferenceNode[];
}

export interface ConstructorReferenceNode extends AbstractReferenceNode {
	kind: ReferenceNodeKind.Constructor;
	signatures: SignatureReferenceNode[];
}

export interface AccessorReferenceNode extends AbstractReferenceNode {
	kind: ReferenceNodeKind.Accessor;
	getSignature?: GetSignatureReferenceNode[];
}

export type ReferenceNode = ClassReferenceNode | SignatureReferenceNode | PropertyReferenceNode | GetSignatureReferenceNode | MethodReferenceNode | ConstructorReferenceNode | AccessorReferenceNode;

import * as data from './reference.json';

export default data as ReferenceNode;
