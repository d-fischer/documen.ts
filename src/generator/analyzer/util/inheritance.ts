import assert from 'assert';
import type ts from 'typescript';
import type { AnalyzeContext } from '../AnalyzeContext';
import type { AccessorReflection } from '../reflections/AccessorReflection';
import { ClassReflection } from '../reflections/ClassReflection';
import type { ConstructorReflection } from '../reflections/ConstructorReflection';
import { InterfaceReflection } from '../reflections/InterfaceReflection';
import type { MethodReflection } from '../reflections/MethodReflection';
import type { PropertyReflection } from '../reflections/PropertyReflection';
import { ReferenceType } from '../types/ReferenceType';

export function handleInheritance(ctx: AnalyzeContext, reflection: PropertyReflection | MethodReflection | AccessorReflection) {
	const parentReflection = reflection.parent;
	// TODO handle interfaces
	if (parentReflection instanceof ClassReflection || parentReflection instanceof InterfaceReflection) {
		const parentDeclaration = parentReflection.declarations[0];
		assert(parentDeclaration);
		const isStatic = reflection.flags.has('isStatic');

		for (const superType of parentReflection.extends ?? []) {
			const tsSuperType = ctx.checker.getTypeAtLocation(isStatic ? superType.node.expression : superType.node);
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			const tsSuperProperty = tsSuperType.getProperties().find(prop => (prop.escapedName ?? prop.name) === reflection.name);
			if (tsSuperProperty) {
				const inherits = tsSuperProperty.getDeclarations()?.some(decl => decl.parent !== parentDeclaration);

				if (inherits) {
					const superReflection = ctx.project.getReflectionForSymbol(tsSuperType.symbol) as ClassReflection | InterfaceReflection | undefined;
					const qualifiedName = `${tsSuperType.symbol.name}.${reflection.name}`;
					if (superReflection) {
						// might be uninitialized here
						// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
						const superProperty = superReflection.members?.find(mem => mem.name === reflection.name && mem.flags.has('isStatic') === isStatic);
						if (superProperty) {
							const packageForSuperProperty = ctx.project.getPackageNameForReflectionId(superProperty.id);

							reflection.inheritedFrom = new ReferenceType(
								qualifiedName,
								undefined,
								superProperty.id,
								packageForSuperProperty
							);
							break;
						}
					}

					const ref = new ReferenceType(qualifiedName);
					ctx.project.registerBrokenReference(tsSuperProperty, ref);
					reflection.inheritedFrom = ref;
					break;
				}
			}
		}
	}
}

export function handleConstructorInheritance(ctx: AnalyzeContext, reflection: ConstructorReflection, signatures: readonly ts.Signature[]) {
	const cls = reflection.parent as ClassReflection;
	const extendedClass = cls.extends?.[0];
	if (!extendedClass) {
		return;
	}

	const ctorDecl = (signatures[0] as ts.Signature | undefined)?.getDeclaration();
	const ctorSymbol = ctorDecl?.symbol;

	if (!ctorSymbol) {
		return;
	}

	const qualifiedName = `${(ctorSymbol.declarations[0].parent as ts.ClassDeclaration).name!.getText()}.constructor`;

	const ctorReflection = ctx.project.getReflectionForSymbol(ctorSymbol);
	if (ctorReflection) {
		if (ctorReflection.id === reflection.id) {
			// not actually inherited
			return;
		}
		const packageForSuperProperty = ctx.project.getPackageNameForReflectionId(ctorReflection.id);

		const ref = new ReferenceType(
			qualifiedName,
			undefined,
			ctorReflection.id,
			packageForSuperProperty
		);
		reflection.inheritedFrom = ref;
		if (!packageForSuperProperty) {
			ctx.project.registerBrokenReference(ctorSymbol, ref);
		}

		return;
	}
	const ref = new ReferenceType(qualifiedName);

	reflection.inheritedFrom = ref;
	ctx.project.registerBrokenReference(ctorSymbol, ref);
}
