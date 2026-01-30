import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/sveltekit/providers/github';
import Google from '@auth/sveltekit/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { getDb } from './db';
import { users, accounts, sessions, verificationTokens } from './db/schema';
import type { D1Database } from '@cloudflare/workers-types';

export function createAuth(platform: App.Platform | undefined) {
	if (!platform?.env?.DB) {
		throw new Error('Database not available');
	}

	const db = getDb(platform.env.DB as unknown as D1Database);

	return SvelteKitAuth({
		adapter: DrizzleAdapter(db, {
			usersTable: users,
			accountsTable: accounts,
			sessionsTable: sessions,
			verificationTokensTable: verificationTokens
		}),
		providers: [
			GitHub({
				clientId: platform.env.AUTH_GITHUB_ID,
				clientSecret: platform.env.AUTH_GITHUB_SECRET
			}),
			Google({
				clientId: platform.env.AUTH_GOOGLE_ID,
				clientSecret: platform.env.AUTH_GOOGLE_SECRET
			})
		],
		secret: platform.env.AUTH_SECRET,
		trustHost: true,
		callbacks: {
			async session({ session, user }) {
				if (session.user) {
					session.user.id = user.id;
					// Fetch user role from database
					const dbUser = await db.query.users.findFirst({
						where: (users, { eq }) => eq(users.id, user.id)
					});
					(session.user as { role?: string }).role = dbUser?.role ?? 'user';
				}
				return session;
			}
		}
	});
}
