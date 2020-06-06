import { ReferenceNodeKind } from './ReferenceNodeKind';

interface ReferenceFlags {
	isExported?: boolean;
	isOptional?: boolean;
	isProtected?: boolean;
	isPrivate?: boolean;
	isStatic?: boolean;
}

interface ReferenceGroup {
	title: string;
	kind: number;
	children: number[];
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

export interface StringLiteralReferenceType {
	type: 'stringLiteral';
	value: string;
}

export interface ReflectionReferenceType {
	type: 'reflection';
	declaration: TypeLiteralReferenceNode;
}

export type ReferenceType = IntrinsicReferenceType | ReferenceReferenceType | ArrayReferenceType | UnionReferenceType | StringLiteralReferenceType | ReflectionReferenceType;

export interface AbstractReferenceNode {
	id: number;
	name: string;
	kind: ReferenceNodeKind;
	kindString: string;
	comment?: ReferenceComment;
	sources: ReferenceSource[];
	flags: ReferenceFlags;
	children?: ReferenceNode[];
	groups: ReferenceGroup[];
	inheritedFrom?: ReferenceType;
}

export interface ClassReferenceNode extends AbstractReferenceNode {
	kind: ReferenceNodeKind.Class;
	typeParameter?: TypeParameterReferenceNode[];
	extendedTypes?: ReferenceType[];
}

export interface SignatureReferenceNode extends AbstractReferenceNode {
	kind: ReferenceNodeKind.CallSignature;
	parameters?: ParameterReferenceNode[];
	type: ReferenceType;
}

export interface PropertyReferenceNode extends AbstractReferenceNode {
	kind: ReferenceNodeKind.Property;
	type: ReferenceType;
}

export interface GetSignatureReferenceNode extends AbstractReferenceNode {
	kind: ReferenceNodeKind.GetSignature;
	parameters?: ReferenceNode[];
	type: ReferenceType;
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

export interface EnumReferenceNode extends AbstractReferenceNode {
	kind: ReferenceNodeKind.Enum;
}

export interface EnumMemberReferenceNode extends AbstractReferenceNode {
	kind: ReferenceNodeKind.EnumMember;
}

export interface TypeAliasReferenceNode extends AbstractReferenceNode {
	kind: ReferenceNodeKind.TypeAlias;
	type: ReferenceType;
}

export interface InterfaceReferenceNode extends AbstractReferenceNode {
	kind: ReferenceNodeKind.Interface;
	typeParameter?: TypeParameterReferenceNode[];
}

export interface TypeParameterReferenceNode extends AbstractReferenceNode {
	kind: ReferenceNodeKind.TypeParameter;
}

export interface ParameterReferenceNode extends AbstractReferenceNode {
	kind: ReferenceNodeKind.Parameter;
	type: ReferenceType;
	defaultValue?: string;
}

export interface TypeLiteralReferenceNode extends AbstractReferenceNode {
	kind: ReferenceNodeKind.TypeLiteral;
	signatures?: SignatureReferenceNode[];
}

export interface VariableReferenceNode extends AbstractReferenceNode {
	kind: ReferenceNodeKind.Variable;
	type: ReferenceType;
	defaultValue?: string;
}

export interface PackageReferenceNode extends AbstractReferenceNode {
	kind: ReferenceNodeKind.Package;
}

export type ReferenceNode =
	ClassReferenceNode | SignatureReferenceNode | PropertyReferenceNode | GetSignatureReferenceNode | MethodReferenceNode | ConstructorReferenceNode | AccessorReferenceNode | EnumReferenceNode |
	EnumMemberReferenceNode | TypeAliasReferenceNode | InterfaceReferenceNode | TypeParameterReferenceNode | ParameterReferenceNode | VariableReferenceNode | PackageReferenceNode;

declare global {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const __DOCTS_REFERENCE: ReferenceNode;
}

// noinspection UnnecessaryLocalVariableJS
const reference = __DOCTS_REFERENCE;
export default reference;
