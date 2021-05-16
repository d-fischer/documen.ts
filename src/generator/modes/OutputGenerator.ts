import type Paths from '../../common/Paths';
import type { SerializedProject } from '../../common/reference';
import type { GeneratorProgressCallback } from './Generator';
import Generator from './Generator';

export abstract class OutputGenerator extends Generator {
	abstract _generateCommons(paths: Paths): Promise<void>;
	abstract _generateDocs(paths: Paths, progressCallback?: GeneratorProgressCallback): Promise<void>;
	abstract _generateReference(data: SerializedProject, paths: Paths, packageName: string, progressCallback?: GeneratorProgressCallback): Promise<void>;
}
