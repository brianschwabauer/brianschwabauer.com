import type { D1Database } from '@cloudflare/workers-types';

declare global {
	namespace App {
		interface Platform {
			env: {
				DB: D1Database;
				AUTH_SECRET: string;
				AUTH_GITHUB_ID: string;
				AUTH_GITHUB_SECRET: string;
				AUTH_GOOGLE_ID: string;
				AUTH_GOOGLE_SECRET: string;
				ANTHROPIC_API_KEY: string;
			};
			context: {
				waitUntil(promise: Promise<unknown>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
		interface Locals {
			session: import('@auth/sveltekit').Session | null;
		}
	}
}

export {};
