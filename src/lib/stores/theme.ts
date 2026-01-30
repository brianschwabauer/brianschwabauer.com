import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

function createThemeStore() {
	const defaultTheme: Theme = 'dark';

	const stored = browser ? localStorage.getItem('theme') as Theme | null : null;
	const prefersDark = browser ? window.matchMedia('(prefers-color-scheme: dark)').matches : true;
	const initial: Theme = stored ?? (prefersDark ? 'dark' : 'light');

	const { subscribe, set, update } = writable<Theme>(initial);

	if (browser) {
		// Apply theme to document immediately
		document.documentElement.dataset.theme = initial;
	}

	return {
		subscribe,
		toggle() {
			update((current) => {
				const next = current === 'light' ? 'dark' : 'light';
				if (browser) {
					localStorage.setItem('theme', next);
					document.documentElement.dataset.theme = next;
				}
				return next;
			});
		},
		set(value: Theme) {
			set(value);
			if (browser) {
				localStorage.setItem('theme', value);
				document.documentElement.dataset.theme = value;
			}
		},
		forceTheme(value: Theme | null) {
			// For pages that need a specific theme (like the space-themed about page)
			if (browser) {
				if (value) {
					document.documentElement.dataset.theme = value;
				} else {
					// Restore original theme
					document.documentElement.dataset.theme = get({ subscribe });
				}
			}
		}
	};
}

export const theme = createThemeStore();
