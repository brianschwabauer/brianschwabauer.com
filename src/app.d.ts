import type { KVNamespace, Ai, SendEmail } from '@cloudflare/workers-types';

declare global {
	namespace App {
		interface Platform {
			env: {
				KV: KVNamespace;
				AI: Ai;
				SEND_EMAIL: SendEmail;
				ADMIN_EMAILS: string;
				CONTACT_FROM_EMAIL: string;
				CONTACT_TO_EMAIL: string;
				AUTH_SECRET: string;
				AUTH_GITHUB_ID: string;
				AUTH_GITHUB_SECRET: string;
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
