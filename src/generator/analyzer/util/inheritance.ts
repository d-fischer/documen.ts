import assert from 'assert';
import type { AnalyzeContext } from '../AnalyzeContext';
import type { AccessorReflection } from '../reflections/AccessorReflection';
import { ClassReflection } from '../reflections/ClassReflection';
import type { MethodReflection } from '../reflections/MethodReflection';
import type { PropertyReflection } from '../reflections/PropertyReflection';
import { ReferenceType } from '../types/ReferenceType';

export function handleInherit(ctx: AnalyzeContext, reflection: PropertyReflection | MethodReflection | AccessorReflection) {
	const classReflection = reflection.parent;
	// TODO handle interfaces
	if (classReflection instanceof ClassReflection) {
		const classDeclaration = classReflection.declarations[0];
		assert(classDeclaration);
		const isStatic = reflection.flags.has('isStatic');

		for (const superClass of classReflection.extends ?? []) {
			const tsSuperClass = ctx.checker.getTypeAtLocation(isStatic ? superClass.node.expression : superClass.node);
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			const tsSuperProperty = tsSuperClass.getProperties().find(prop => (prop.escapedName ?? prop.name) === reflection.name);
			if (tsSuperProperty) {
				const inherits = tsSuperProperty.getDeclarations()?.some(decl => decl.parent !== classDeclaration);

				if (inherits) {
					const superReflection = ctx.project.getReflectionForSymbol(tsSuperClass.symbol) as ClassReflection | undefined;
					const qualifiedName = `${tsSuperClass.symbol.name}.${reflection.name}`;
					if (superReflection) {
						const superProperty = superReflection.members.find(mem => mem.name === reflection.name && mem.flags.has('isStatic') === isStatic);
						if (superProperty) {
							const reflectionIdForSuperProperty = ctx.project.getReflectionIdForSymbol(superProperty.symbol);
							const packageForSuperProperty = ctx.project.getPackageNameForReflectionId(reflectionIdForSuperProperty);

							reflection.inheritedFrom = new ReferenceType(
								qualifiedName,
								undefined,
								reflectionIdForSuperProperty,
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
