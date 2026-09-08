import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {releaseTimestamp} from './public/model-order.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const source = path.join(root, 'public');
const data = JSON.parse(await fs.readFile(path.join(source, 'data.json'), 'utf8'));
const ids = new Set();
for(const release of data.modelReleases || []) {
  if(!release.model || !release.provider || (release.releaseDate && !releaseTimestamp(release.releaseDate)))throw new Error(`Invalid model release: ${release.model}`);
}
for (const topic of data.topics) {
  if (!topic.id || !topic.title || !Array.isArray(topic.samples)) throw new Error('Each topic needs id, title and samples.');
  for (const sample of topic.samples) {
    if (!sample.id || !sample.model || !sample.src || ids.has(sample.id)) throw new Error(`Incomplete or duplicate sample: ${sample.id}`);
    ids.add(sample.id);
    const asset = path.resolve(source, sample.src);
    if (!asset.startsWith(source + path.sep)) throw new Error(`Asset must be inside public/: ${sample.src}`);
    await fs.access(asset);
  }
}
await fs.cp(source, path.join(root, 'dist'), { recursive: true });
console.log(`Built ${data.topics.length} topics and ${ids.size} samples into dist/.`);
