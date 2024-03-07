interface ReferenceFlags {
	isExported?: boolean;
	isOptional?: boolean;
	isProtected?: boolean;
	isPrivate?: boolean;
	isStatic?: boolean;
	isExternal?: boolean;
	isInternal?: boolean;
}

export interface ReferenceCommentTag {
	tag: string;
	text?: string;
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

export interface ExternalPackageReference {
	generator: string;
	packageName: string;
	baseUrl: string;
	originalName: string;
	nodeKind: string;
}

export interface IntrinsicReferenceType {
	type: 'intrinsic';
	name: string;
}

export interface ReferenceReferenceType {
	type: 'reference';
	name: string;
	id?: number;
	isTypeParameter?: true;
	package?: string;
	externalReference?: ExternalPackageReference;
	typeArguments?: ReferenceType[];
}

export interface ArrayReferenceType {
	type: 'array';
	elementType?: ReferenceType;
}

export interface OptionalReferenceType {
	type: 'optional';
	elementType: ReferenceType;
}

export interface UnionReferenceType {
	type: 'union';
	types: ReferenceType[];
}

export interface IntersectionReferenceType {
	type: 'intersection';
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

export interface TypeOperatorReferenceType {
	type: 'typeOperator';
	operator: 'keyof' | 'unique' | 'readonly';
	target: ReferenceType;
}

export interface TupleReferenceType {
	type: 'tuple';
	elements: ReferenceType[];
}

export interface NamedTupleMemberReferenceType {
	type: 'named-tuple-member';
	name: string;
	isOptional: boolean;
	elementType: ReferenceType;
}

export type ReferenceType =
	| IntrinsicReferenceType
	| ReferenceReferenceType
	| ArrayReferenceType
	| UnionReferenceType
	| IntersectionReferenceType
	| LiteralReferenceType
	| OptionalReferenceType
	| ReflectionReferenceType
	| TypeOperatorReferenceType
	| TupleReferenceType
	| NamedTupleMemberReferenceType;

export interface AbstractReferenceNode {
	id: number;
	name: string;
	kind: string;
	comment?: ReferenceComment;
	location?: ReferenceLocation;
	flags?: ReferenceFlags;
	inheritedFrom?: ReferenceType;
	overwrites?: ReferenceType;
}

export interface ClassReferenceNode extends AbstractReferenceNode {
	kind: 'class';
	typeParameters?: TypeParameterReferenceNode[];
	extendedTypes?: ReferenceType[];
	ctor?: ConstructorReferenceNode;
	members: ReferenceNode[]; // TODO less generic I guess
}

export interface CallSignatureReferenceNode extends AbstractReferenceNode {
	kind: 'callSignature';
	parameters: ParameterReferenceNode[];
	type: ReferenceType;
	typeParameters?: TypeParameterReferenceNode[];
}

export interface ConstructSignatureReferenceNode extends AbstractReferenceNode {
	kind: 'constructSignature';
	parameters: ParameterReferenceNode[];
}

export interface PropertyReferenceNode extends AbstractReferenceNode {
	kind: 'property';
	type: ReferenceType;
}

export interface GetSignatureReferenceNode extends AbstractReferenceNode {
	kind: 'getSignature';
	parameters: ReferenceNode[];
	type: ReferenceType;
}

export interface SetSignatureReferenceNode extends AbstractReferenceNode {
	kind: 'setSignature';
	parameters?: ReferenceNode[];
	type: ReferenceType;
}

export interface FunctionReferenceNode extends AbstractReferenceNode {
	kind: 'function';
	signatures?: CallSignatureReferenceNode[];
}

export interface MethodReferenceNode extends AbstractReferenceNode {
	kind: 'method';
	signatures?: CallSignatureReferenceNode[];
}

export interface ConstructorReferenceNode extends AbstractReferenceNode {
	kind: 'constructor';
	signatures: CallSignatureReferenceNode[];
}

export interface AccessorReferenceNode extends AbstractReferenceNode {
	kind: 'accessor';
	getSignature?: GetSignatureReferenceNode;
	setSignature?: SetSignatureReferenceNode;
}

export interface EnumReferenceNode extends AbstractReferenceNode {
	kind: 'enum';
	members: EnumMemberReferenceNode[];
}

export interface EnumMemberReferenceNode extends AbstractReferenceNode {
	kind: 'enumMember';
	value: string;
}

export interface TypeAliasReferenceNode extends AbstractReferenceNode {
	kind: 'typeAlias';
	type: ReferenceType;
	typeParameters?: TypeParameterReferenceNode[];
}

export interface InterfaceReferenceNode extends AbstractReferenceNode {
	kind: 'interface';
	typeParameters?: TypeParameterReferenceNode[];
	extendedTypes?: ReferenceType[];
	members: ReferenceNode[]; // TODO less generic I guess
}

export interface TypeParameterReferenceNode extends AbstractReferenceNode {
	kind: 'typeParameter';
	default?: ReferenceType;
	constraint?: ReferenceType;
}

export interface ParameterReferenceNode extends AbstractReferenceNode {
	kind: 'parameter';
	type: ReferenceType;
	defaultValue?: string;
}

export interface TypeLiteralReferenceNode extends AbstractReferenceNode {
	kind: 'typeLiteral';
	members: ReferenceNode[]; // TODO less generic I guess
	signatures?: CallSignatureReferenceNode[];
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
	| ConstructSignatureReferenceNode
	| CallSignatureReferenceNode
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

export interface SerializedPackage {
	packageName: string;
	folderName?: string;
	symbols: ReferenceNode[];
}

export interface SerializedProject {
	packages: SerializedPackage[];
}

declare global {
	const __DOCTS_REFERENCE: SerializedProject;
}

// noinspection UnnecessaryLocalVariableJS
const reference = __DOCTS_REFERENCE;
export default reference;
