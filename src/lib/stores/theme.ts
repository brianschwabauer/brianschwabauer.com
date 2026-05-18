import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

function readStoredPreference(): Theme {
	const stored = localStorage.getItem('theme') as Theme | null;
	if (stored === 'light' || stored === 'dark') return stored;
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function createThemeStore() {
	// Initial value comes from the DOM, which the bootstrap script in app.html
	// has already set for the current route. Don't touch the DOM here — that
	// would race with the bootstrap and any beforeNavigate-driven theme swap.
	const initial: Theme = browser
		? ((document.documentElement.dataset.theme as Theme | undefined) ?? 'light')
		: 'light';

	const { subscribe, set } = writable<Theme>(initial);

	return {
		subscribe,
		toggle() {
			if (!browser) return;
			const next: Theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
			localStorage.setItem('theme', next);
			document.documentElement.dataset.theme = next;
			set(next);
		},
		set(value: Theme) {
			if (!browser) return;
			localStorage.setItem('theme', value);
			document.documentElement.dataset.theme = value;
			set(value);
		},
		forceTheme(value: Theme | null) {
			if (!browser) return;
			const applied: Theme = value ?? readStoredPreference();
			document.documentElement.dataset.theme = applied;
			set(applied);
		}
	};
}

export const theme = createThemeStore();
