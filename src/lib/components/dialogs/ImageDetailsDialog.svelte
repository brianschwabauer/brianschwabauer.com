<script lang="ts" module>
	export interface ImageDetailsResult {
		alt: string;
		caption: string;
	}

	export interface ImageDetailsOptions {
		title?: string;
		previewSrc?: string;
		previewAlt?: string | null;
		previewStyle?: string;
		alt?: string;
		caption?: string;
	}

	/**
	 * Open the shared ImageDetailsForm in a standalone modal. Resolves with the
	 * new values, or `null` if cancelled. Used by surfaces (like the blog
	 * post editor) that don't have a host modal to render a side panel into.
	 */
	export async function editImageDetails(
		options: ImageDetailsOptions = {},
	): Promise<ImageDetailsResult | null> {
		const { mount, unmount } = await import('svelte');
		const mod = await import('./ImageDetailsDialog.svelte');
		const DialogComponent = mod.default;

		return new Promise((resolve) => {
			let container = document.querySelector('.portals');
			if (!container) {
				container = document.createElement('div');
				container.classList.add('portals');
				document.body.appendChild(container);
			}
			const wrapper = document.createElement('div');
			container.appendChild(wrapper);

			let instance: Record<string, unknown>;

			const props = $state({
				open: false,
				title: options.title ?? 'Image details',
				previewSrc: options.previewSrc,
				previewAlt: options.previewAlt ?? null,
				previewStyle: options.previewStyle ?? '',
				alt: options.alt ?? '',
				caption: options.caption ?? '',
				oncancel: () => cleanup(null),
				onsave: (values: ImageDetailsResult) => cleanup(values),
			});

			function cleanup(result: ImageDetailsResult | null) {
				resolve(result);
				try {
					unmount(instance);
				} catch {
					// already unmounted
				}
				wrapper.remove();
			}

			instance = mount(DialogComponent, { target: wrapper, props });

			requestAnimationFrame(() => {
				props.open = true;
			});
		});
	}
</script>

<script lang="ts">
	import { Modal } from '@delightstack/components/actions';
	import ImageDetailsForm, {
		type ImageDetailsValues,
	} from '$lib/components/media/ImageDetailsForm.svelte';

	let {
		open = $bindable(false) as boolean,
		title = 'Image details',
		previewSrc = undefined as string | undefined,
		previewAlt = null as string | null,
		previewStyle = '',
		alt = '',
		caption = '',
		oncancel = undefined as (() => void) | undefined,
		onsave = undefined as ((values: ImageDetailsValues) => void) | undefined,
	} = $props();

	function handleCancel() {
		open = false;
		oncancel?.();
	}

	function handleSave(values: ImageDetailsValues) {
		open = false;
		onsave?.(values);
	}
</script>

<Modal
	bind:open
	title=""
	closable
	disableCloseIcon
	width="min(480px, 100vw - 2rem)"
	onclose={() => {
		handleCancel();
		return true;
	}}
	onbackdropclick={handleCancel}
	class="image-details-modal">
	<ImageDetailsForm
		{title}
		{previewSrc}
		{previewAlt}
		{previewStyle}
		{alt}
		{caption}
		onSave={handleSave}
		onCancel={handleCancel} />
</Modal>
