import { promises as fs } from 'fs';
import path from 'path';
import { SourceMapConsumer } from 'source-map';

const consumers = new Map<string, SourceMapConsumer>();

export async function getSourceMapConsumer(baseFileName: string, mapUrl: string) {
	const absolutePath = path.resolve(baseFileName, mapUrl);

	if (consumers.has(absolutePath)) {
		return consumers.get(absolutePath)!;
	}

	const mapContents = await fs.readFile(absolutePath, 'utf8');
	const newConsumer = (await new SourceMapConsumer(mapContents)) as SourceMapConsumer;
	consumers.set(absolutePath, newConsumer);

	return newConsumer;
}
