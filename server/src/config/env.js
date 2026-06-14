import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(configDir, '../..');

dotenv.config();
dotenv.config({ path: path.join(serverRoot, '.env'), override: false });
