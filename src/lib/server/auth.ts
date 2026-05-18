import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/sveltekit/providers/google';

function parseAdminEmails(raw: string | undefined): Set<string> {
	if (!raw) return new Set();
	return new Set(
		raw
			.split(',')
			.map((email) => email.trim().toLowerCase())
			.filter(Boolean)
	);
}

export function isAdminEmail(email: string | null | undefined, adminList: string | undefined) {
	if (!email) return false;
	return parseAdminEmails(adminList).has(email.toLowerCase());
}

export function createAuth(platform: App.Platform | undefined) {
	const env = platform?.env;
	if (!env?.AUTH_SECRET) {
		throw new Error('AUTH_SECRET not configured');
	}

	const adminEmails = env.ADMIN_EMAILS;

	return SvelteKitAuth({
		session: { strategy: 'jwt' },
		providers: [
			Google({
				clientId: env.AUTH_GOOGLE_ID,
				clientSecret: env.AUTH_GOOGLE_SECRET
			})
		],
		secret: env.AUTH_SECRET,
		trustHost: true,
		callbacks: {
			async jwt({ token, user }) {
				if (user?.email) token.email = user.email;
				token.role = isAdminEmail(token.email as string | undefined, adminEmails) ? 'admin' : 'user';
				return token;
			},
			async session({ session, token }) {
				if (session.user) {
					(session.user as { role?: string }).role = (token.role as string) ?? 'user';
				}
				return session;
			}
		}
	});
}
