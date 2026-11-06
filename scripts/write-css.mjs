// Writes dist/style.css for people who load the CSS themselves (injectStyles: false)
import { writeFileSync } from 'node:fs';
import { reedHuntCss } from '../dist/index.js';

writeFileSync(new URL('../dist/style.css', import.meta.url), reedHuntCss.trim() + '\n');
console.log('dist/style.css written');
