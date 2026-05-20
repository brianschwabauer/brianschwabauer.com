import { writable } from 'svelte/store';

export const hideHeaderLogo = writable(false);

// Search modal open state — shared so both the header and the mobile bottom
// nav can open the single SearchModal instance.
export const searchOpen = writable(false);
