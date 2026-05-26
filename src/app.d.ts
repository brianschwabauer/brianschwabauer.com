import type {
	KVNamespace,
	Ai,
	SendEmail,
	R2Bucket,
	Fetcher,
} from '@cloudflare/workers-types';

declare global {
	namespace App {
		interface Platform {
			env: {
				KV: KVNamespace;
				R2: R2Bucket;
				AI: Ai;
				SEND_EMAIL: SendEmail;
				// Service binding to the brianschwabauer-images worker.
				// In dev, vite proxies /api/images/* and /cdn/image/* directly to
				// localhost:8787 instead of going through this binding.
				IMAGE_PROCESSOR: Fetcher;
				ADMIN_EMAILS: string;
				CONTACT_FROM_EMAIL: string;
				CONTACT_TO_EMAIL: string;
				AUTH_SECRET: string;
				AUTH_GOOGLE_ID: string;
				AUTH_GOOGLE_SECRET: string;
				ANTHROPIC_API_KEY: string;
			};
		}
		interface Locals {
			session: import('@auth/sveltekit').Session | null;
			auth?: () => Promise<import('@auth/sveltekit').Session | null>;
		}
	}
}

export {};
