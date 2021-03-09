interface ReferenceFlags {
	isExported?: boolean;
	isOptional?: boolean;
	isProtected?: boolean;
	isPrivate?: boolean;
	isStatic?: boolean;
	isExternal?: boolean;
}

export interface ReferenceCommentTag {
	tag: string;
	text: string;
	param?: string;
}

export interface ReferenceComment {
	shortText?: string;
	text?: string;
	tags?: ReferenceCommentTag[];
}

export interface ReferenceLocation {
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
	id?: number;
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

export interface LiteralReferenceType {
	type: 'literal';
	value: string | number | null;
}

export interface ReflectionReferenceType {
	type: 'reflection';
	declaration: TypeLiteralReferenceNode;
}

export interface TupleReferenceType {
	type: 'tuple';
	elements: TupleMemberReferenceType[];
}

export interface NamedTupleMemberReferenceType {
	type: 'named-tuple-member';
	name: string;
	isOptional: boolean;
	element: ReferenceType;
}

export type ReferenceType =
	| IntrinsicReferenceType
	| ReferenceReferenceType
	| ArrayReferenceType
	| UnionReferenceType
	| LiteralReferenceType
	| ReflectionReferenceType
	| TupleReferenceType;
export type TupleMemberReferenceType = NamedTupleMemberReferenceType | ReferenceType;

export interface AbstractReferenceNode {
	id: number;
	name: string;
	kind: string;
	comment?: ReferenceComment;
	location?: ReferenceLocation;
	flags?: ReferenceFlags;
	children?: ReferenceNode[];
	inheritedFrom?: ReferenceType;
}

export interface ClassReferenceNode extends AbstractReferenceNode {
	kind: 'class';
	typeParameter?: TypeParameterReferenceNode[];
	extendedTypes?: ReferenceType[];
	ctor?: ConstructorReferenceNode;
	members: ReferenceNode[]; // TODO less generic I guess
}

export interface SignatureReferenceNode extends AbstractReferenceNode {
	kind: 'callSignature';
	parameters?: ParameterReferenceNode[];
	type: ReferenceType;
	typeParameter?: TypeParameterReferenceNode[];
}

export interface PropertyReferenceNode extends AbstractReferenceNode {
	kind: 'property';
	type: ReferenceType;
}

export interface GetSignatureReferenceNode extends AbstractReferenceNode {
	kind: 'getSignature';
	parameters?: ReferenceNode[];
	type: ReferenceType;
}

export interface SetSignatureReferenceNode extends AbstractReferenceNode {
	kind: 'setSignature';
	parameters?: ReferenceNode[];
	type: ReferenceType;
}

export interface FunctionReferenceNode extends AbstractReferenceNode {
	kind: 'function';
	signatures?: SignatureReferenceNode[];
}

export interface MethodReferenceNode extends AbstractReferenceNode {
	kind: 'method';
	signatures?: SignatureReferenceNode[];
}

export interface ConstructorReferenceNode extends AbstractReferenceNode {
	kind: 'constructor';
	signatures: SignatureReferenceNode[];
}

export interface AccessorReferenceNode extends AbstractReferenceNode {
	kind: 'accessor';
	getSignature?: GetSignatureReferenceNode;
	setSignature?: SetSignatureReferenceNode;
}

export interface EnumReferenceNode extends AbstractReferenceNode {
	kind: 'enum';
}

export interface EnumMemberReferenceNode extends AbstractReferenceNode {
	kind: 'enumMember';
}

export interface TypeAliasReferenceNode extends AbstractReferenceNode {
	kind: 'typeAlias';
	type: ReferenceType;
}

export interface InterfaceReferenceNode extends AbstractReferenceNode {
	kind: 'interface';
	typeParameter?: TypeParameterReferenceNode[];
}

export interface TypeParameterReferenceNode extends AbstractReferenceNode {
	kind: 'typeParameter';
}

export interface ParameterReferenceNode extends AbstractReferenceNode {
	kind: 'parameter';
	type: ReferenceType;
	defaultValue?: string;
}

export interface TypeLiteralReferenceNode extends AbstractReferenceNode {
	kind: 'typeLiteral';
	signatures?: SignatureReferenceNode[];
}

export interface VariableReferenceNode extends AbstractReferenceNode {
	kind: 'variable';
	type: ReferenceType;
	defaultValue?: string;
}

export interface ReferenceReferenceNode extends AbstractReferenceNode {
	kind: 'reference';
	target: number;
}

export interface PackageReferenceNode extends AbstractReferenceNode {
	kind: 'package';
}

export type ReferenceNode =
	| ClassReferenceNode
	| SignatureReferenceNode
	| PropertyReferenceNode
	| GetSignatureReferenceNode
	| SetSignatureReferenceNode
	| FunctionReferenceNode
	| MethodReferenceNode
	| ConstructorReferenceNode
	| AccessorReferenceNode
	| EnumReferenceNode
	| EnumMemberReferenceNode
	| TypeAliasReferenceNode
	| InterfaceReferenceNode
	| TypeParameterReferenceNode
	| TypeLiteralReferenceNode
	| ParameterReferenceNode
	| ReferenceReferenceNode
	| VariableReferenceNode
	| PackageReferenceNode;

declare global {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const __DOCTS_REFERENCE: ReferenceNode;
}

// noinspection UnnecessaryLocalVariableJS
const reference = __DOCTS_REFERENCE;
export default reference;
