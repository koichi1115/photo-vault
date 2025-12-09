import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
// Try multiple possible locations to handle different execution contexts
const possibleEnvPaths = [
  path.join(process.cwd(), '.env'),        // If running from root
  path.join(process.cwd(), '..', '.env'),  // If running from backend (npm workspace)
];

let envLoaded = false;
for (const envPath of possibleEnvPaths) {
  console.log('📁 Trying .env from:', envPath);
  const result = dotenv.config({ path: envPath });
  if (!result.error && result.parsed) {
    console.log('✅ .env loaded successfully from:', envPath);
    console.log('📊 Loaded keys:', Object.keys(result.parsed).join(', '));
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.error('❌ Failed to load .env from any location');
  console.error('   Current working directory:', process.cwd());
}

// Export a flag so other modules know env is loaded
export const ENV_LOADED = envLoaded;
