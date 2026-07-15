<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import SnapStrip from '../primitives/SnapStrip.svelte';
	import { type GalleryItem } from '@delightstack/components/media';
	import LightboxGallery from '../primitives/LightboxGallery.svelte';

	const spunkstersImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_the_spunksters-live_show_behind_the_scenes_photos_01.avif',
			width: 2048,
			height: 1365,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_the_spunksters-live_show_behind_the_scenes_photos_02.avif',
			width: 1365,
			height: 2048,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_the_spunksters-live_show_behind_the_scenes_photos_03.avif',
			width: 2048,
			height: 1365,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_the_spunksters-live_show_behind_the_scenes_photos_04.avif',
			width: 2048,
			height: 1365,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_the_spunksters-live_show_behind_the_scenes_photos_05.avif',
			width: 2048,
			height: 1365,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_the_spunksters-live_show_behind_the_scenes_photos_06.avif',
			width: 2048,
			height: 1365,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_the_spunksters-live_show_behind_the_scenes_photos_07.avif',
			width: 1536,
			height: 2048,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_the_spunksters-live_show_behind_the_scenes_photos_08.jpg',
			width: 720,
			height: 960,
		},
	];

	const messages = [
		{ from: '+1 (913) ••• 4451', text: 'this is HILARIOUS' },
		{ from: '+1 (816) ••• 8210', text: 'Why is Zordon a dog' },
		{ from: '+1 (913) ••• 2199', text: 'cried laughing at the PR3 trailer' },
		{ from: '+1 (785) ••• 0772', text: 'I love this so much' },
		{ from: '+1 (816) ••• 5621', text: 'Brian and Kevin forever ❤️' },
		{ from: '+1 (913) ••• 9088', text: 'Oscars who?' },
	];

	// Standalone images + inline video posters combined into one lightbox-only Gallery.
	// Order matches document order:
	//   0: Spunksters logo image
	//   1: The Spunksters awards show video
	//   2: Kevin (Bubbly Bros) image
	//   3: Bubbly Bros video
	//   4: Power Rangers III logo image
	//   5: Kevin visits Zordon's grave image
	//   6: Power Rangers III trailer video
	const sectionExtras: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_the_spunksters-logo_animation.avif',
			width: 480,
			height: 270,
			alt: 'The Spunksters logo animation',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_the_spunksters/master.m3u8',
			poster:
				'https://cdn.brianschwabauer.com/media/2013-06-22_the_spunksters/poster.jpg',
			width: 1920,
			height: 1080,
			caption: 'The Spunksters (2013) — the live awards show',
			alt: 'The Spunksters (2013) — the live awards show',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_bubbly_bros-kevin_jumps_up_and_down.avif',
			width: 480,
			height: 270,
			alt: 'Kevin from Bubbly Bros',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_bubbly_bros/master.m3u8',
			poster: 'https://cdn.brianschwabauer.com/media/2013-06-22_bubbly_bros/poster.jpg',
			width: 1920,
			height: 1080,
			caption: 'Bubbly Bros (2013) — photo music video',
			alt: 'Bubbly Bros (2013) — photo music video',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_power_rangers_iii_trailer-logo_animation.avif',
			width: 480,
			height: 270,
			alt: 'Power Rangers III logo animation',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_power_rangers_iii_trailer-kevin_visits_zordons_grave.avif',
			width: 480,
			height: 270,
			alt: "Kevin visits Zordon's grave",
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_power_rangers_iii_trailer/master.m3u8',
			poster:
				'https://cdn.brianschwabauer.com/media/2013-06-22_power_rangers_iii_trailer/poster.jpg',
			width: 1920,
			height: 1080,
			caption: 'Power Rangers 360 III — fake trailer (2013)',
			alt: 'Power Rangers 360 III — fake trailer (2013)',
		},
	];
	let gallery = $state<ReturnType<typeof LightboxGallery>>();
	let btsGallery = $state<ReturnType<typeof LightboxGallery>>();
</script>

<SectionShell id="spunksters" year="2013" label="The Spunksters" theme="spunksters">
	<div class="container">
		<Reveal>
			<YearMark year="2013" subtitle="End of an era" color="#ffd934" />
		</Reveal>

		<div class="lockup">
			<Reveal>
				<div class="eyebrow">CLOSING CREDITS · CHILDHOOD</div>
				<h2 class="title">
					<span class="grow w1">Hunky</span>
					<span class="grow w2">Spunky's</span>
					<span class="grow w3">Oscars.</span>
				</h2>
				<p class="lede">
					High school was wrapping up. Kevin was going to Baylor. I was going to Missouri
					State. We knew we'd see each other again — eventually — but Hunky Spunky
					Productions, the version with our childhood in it, was done.
				</p>
				<p class="lede">
					So we sent it off the only way we knew how: <strong>The Spunksters</strong>
					— an awards show, modeled after the Oscars, for ourselves. Awards in every category.
					Speeches. Live-streamed. Projected on the side of a house. Forty friends in a backyard,
					watching a live video feed of Kevin hosting from inside, so the host appeared on a
					twenty-foot tall projection like a giant.
				</p>
			</Reveal>
		</div>

		<div class="logo-stage">
			<Reveal variant="up">
				<LazyMedia
					src="https://cdn.brianschwabauer.com/media/2013-06-22_the_spunksters-logo_animation.avif"
					alt="The Spunksters logo animation"
					ratio="16 / 9"
					onclick={(e) => gallery?.open(0, e.currentTarget)} />
			</Reveal>
			<Reveal variant="up" delay={100}>
				<div class="inline-video">
					<LazyMedia
						src="https://cdn.brianschwabauer.com/media/2013-06-22_the_spunksters/poster.jpg"
						alt="The Spunksters (2013) — the live awards show"
						ratio="16 / 9"
						video
						onclick={(e) => gallery?.open(1, e.currentTarget)} />
				</div>
			</Reveal>
		</div>

		<div class="sms-block">
			<Reveal>
				<div class="sms-grid">
					<div class="sms-text">
						<div class="sms-eyebrow">A SMALL, RIDICULOUS THING I'M PROUD OF</div>
						<h3 class="sub">
							An SMS feature, hacked together because Google Voice doesn't have an API.
						</h3>
						<p>
							I wanted viewers to be able to text in their reactions and have them appear
							on the projected wall. Google Voice didn't (and doesn't) expose an API. But
							it can forward incoming texts to email. So: text → Google Voice → email → my
							little polling script → OBS overlay. Untested until the moment it had to
							work. It worked.
						</p>
						<p class="aside">
							I deeply believe in this: live life all the way through, even the parts that
							don't matter. Backyard awards shows are nothing. It is so much more fun to
							take them seriously than to phone them in.
						</p>
					</div>
					<div class="phone">
						<div class="phone-frame">
							<div class="phone-bar">9:41 PM · The Spunksters · live</div>
							<ul class="phone-msgs">
								{#each messages as msg, i}
									<li style:--i={i}>
										<div class="from">{msg.from}</div>
										<div class="bubble">{msg.text}</div>
									</li>
								{/each}
							</ul>
						</div>
					</div>
				</div>
			</Reveal>
		</div>

		<Reveal variant="up">
			<div class="bts">
				<div class="bts-eyebrow bleed-head">
					BEHIND THE SCENES · {spunkstersImages.length} PHOTOS
				</div>
				<SnapStrip
					items={spunkstersImages}
					onitemclick={({ index, element }) => btsGallery?.open(index, element)} />
			</div>
		</Reveal>
		<LightboxGallery
			bind:this={btsGallery}
			key="spunksters-photos"
			items={spunkstersImages} />

		<div class="bubbly-bros">
			<Reveal variant="left">
				<LazyMedia
					src="https://cdn.brianschwabauer.com/media/2013-06-22_bubbly_bros-kevin_jumps_up_and_down.avif"
					alt="Kevin from Bubbly Bros"
					ratio="4 / 3"
					onclick={(e) => gallery?.open(2, e.currentTarget)} />
			</Reveal>
			<Reveal>
				<h3 class="sub">Bubbly Bros — the unofficial encore</h3>
				<p>
					For the show, Kevin and I wrote a song called "Bubbly Bros". A rap song about
					two guys who love blowing bubbles. It sounds like a constant innuendo. It is
					not. We're really just rapping about bubbles.
				</p>
				<p>
					We ran out of time to shoot a real music video, so we did a photo shoot, set it
					to the song, and called it done. It got cheers from a backyard. It belongs
					there.
				</p>
				<div class="bubbly-video">
					<LazyMedia
						src="https://cdn.brianschwabauer.com/media/2013-06-22_bubbly_bros/poster.jpg"
						alt="Bubbly Bros (2013) — photo music video"
						ratio="16 / 9"
						video
						onclick={(e) => gallery?.open(3, e.currentTarget)} />
				</div>
			</Reveal>
		</div>

		<div class="prtrailer">
			<Reveal variant="up">
				<h3 class="sub">A fake Power Rangers III trailer</h3>
				<p>
					For The Spunksters we also cut a fake trailer for a "Power Rangers III". An
					adult Kevin — the blue ranger from our childhood movies — has not let his glory
					days go. The other rangers have grown up. They have kids. They have jobs. Kevin
					doesn't. The trailer ends with a gag where the words "in 3D" break the letterbox
					bars. It still kills me.
				</p>
			</Reveal>
			<Reveal variant="up" delay={100}>
				<div class="trailer-pair">
					<LazyMedia
						src="https://cdn.brianschwabauer.com/media/2013-06-22_power_rangers_iii_trailer-logo_animation.avif"
						alt="Power Rangers III logo animation"
						ratio="16 / 9"
						onclick={(e) => gallery?.open(4, e.currentTarget)} />
					<LazyMedia
						src="https://cdn.brianschwabauer.com/media/2013-06-22_power_rangers_iii_trailer-kevin_visits_zordons_grave.avif"
						alt="Kevin visits Zordon's grave"
						ratio="16 / 9"
						onclick={(e) => gallery?.open(5, e.currentTarget)} />
				</div>
			</Reveal>
			<Reveal variant="up" delay={140}>
				<div class="inline-video">
					<LazyMedia
						src="https://cdn.brianschwabauer.com/media/2013-06-22_power_rangers_iii_trailer/poster.jpg"
						alt="Power Rangers 360 III — fake trailer (2013)"
						ratio="16 / 9"
						video
						onclick={(e) => gallery?.open(6, e.currentTarget)} />
				</div>
			</Reveal>
		</div>

		<Reveal variant="up">
			<div class="endcap">
				<div class="endcap-line"></div>
				<div class="endcap-text">
					<span>END OF CHILDHOOD CHAPTER</span>
					<strong>Off to college, in two different states.</strong>
				</div>
				<div class="endcap-line"></div>
			</div>
		</Reveal>
	</div>

	<LightboxGallery
		bind:this={gallery}
		key="spunksters"
		items={sectionExtras}
		autoplay_video />
</SectionShell>

<style>
	:global([data-theme='spunksters']) {
		background:
			radial-gradient(ellipse at top, rgba(255, 217, 52, 0.06), transparent 50%),
			linear-gradient(180deg, #0a0708, #14110a 50%, #06050a);
		color: #fff5d6;
	}
	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
	}
	.lockup {
		text-align: center;
		margin-bottom: 3rem;
	}
	.eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #ffd934;
		margin-bottom: 1rem;
	}
	.title {
		display: flex;
		justify-content: center;
		gap: 0.4rem;
		font-size: clamp(2.4rem, 8vw, 6rem);
		font-weight: 900;
		line-height: 1;
		letter-spacing: -0.03em;
		margin: 0 0 1.4rem;
		flex-wrap: wrap;
	}
	.grow {
		background: linear-gradient(180deg, #ffe57a 0%, #ffd934 50%, #c79900 100%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		text-shadow: 0 0 60px rgba(255, 217, 52, 0.15);
	}
	.lede {
		font-size: clamp(1.05rem, 1.5vw, 1.2rem);
		line-height: 1.6;
		max-width: 48rem;
		margin: 0 auto 1rem;
	}
	.lede strong {
		color: #ffd934;
	}

	.logo-stage {
		max-width: 800px;
		margin: 3rem auto 4rem;
	}

	.sms-block {
		margin: 4rem 0;
	}
	.sms-grid {
		display: grid;
		grid-template-columns: 1.3fr 1fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: center;
	}
	@media (max-width: 768px) {
		.sms-grid {
			grid-template-columns: 1fr;
		}
	}
	.sms-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #ffd934;
		margin-bottom: 0.6rem;
	}
	.sub {
		font-size: clamp(1.4rem, 2.4vw, 2rem);
		font-weight: 800;
		margin: 0 0 0.6rem;
		line-height: 1.2;
	}
	.sms-text p {
		line-height: 1.6;
		margin-bottom: 1rem;
		max-width: 36rem;
	}
	.aside {
		padding: 1rem 1.2rem;
		background: rgba(255, 217, 52, 0.06);
		border-left: 3px solid #ffd934;
		border-radius: 0 8px 8px 0;
		font-style: italic;
	}

	.phone {
		display: flex;
		justify-content: center;
	}
	.phone-frame {
		width: 280px;
		background: #111;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 28px;
		padding: 1.4rem 1rem 1.2rem;
		box-shadow:
			0 30px 80px rgba(0, 0, 0, 0.6),
			0 6px 20px rgba(255, 217, 52, 0.15);
	}
	.phone-bar {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		text-align: center;
		opacity: 0.6;
		margin-bottom: 0.8rem;
	}
	.phone-msgs {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.phone-msgs li {
		opacity: 0;
		transform: translateY(20px);
		animation: msgIn 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
		animation-delay: calc(var(--i) * 0.6s);
	}
	@keyframes msgIn {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.from {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		opacity: 0.5;
		margin-bottom: 0.15rem;
	}
	.bubble {
		background: linear-gradient(135deg, #ffd934, #ffaa00);
		color: #1a1100;
		padding: 0.5rem 0.8rem;
		border-radius: 16px 16px 16px 4px;
		font-size: 0.85rem;
		font-weight: 500;
		display: inline-block;
		max-width: 90%;
	}

	.bts {
		margin: 4rem 0;
	}
	.bts-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #ffd934;
		margin-bottom: 1rem;
	}

	.bubbly-bros {
		display: grid;
		grid-template-columns: 1fr 1.4fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: center;
		margin: 4rem 0;
		padding: 2rem;
		background: rgba(255, 217, 52, 0.04);
		border-radius: 14px;
	}
	@media (max-width: 768px) {
		.bubbly-bros {
			grid-template-columns: 1fr;
		}
	}
	.bubbly-bros p {
		line-height: 1.6;
		margin-bottom: 1rem;
		max-width: 36rem;
	}

	.prtrailer {
		margin: 4rem 0;
	}
	.prtrailer p {
		max-width: 56rem;
		line-height: 1.6;
		margin-bottom: 1.5rem;
	}
	.trailer-pair {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.8rem;
	}
	@media (max-width: 640px) {
		.trailer-pair {
			grid-template-columns: 1fr;
		}
	}

	.endcap {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		margin: 5rem 0 0;
		opacity: 0.85;
	}
	.endcap-line {
		flex: 1;
		height: 1px;
		background: linear-gradient(90deg, transparent, #ffd934, transparent);
	}
	.endcap-text {
		text-align: center;
		font-family: var(--font-mono);
	}
	.endcap-text span {
		font-size: 0.75rem;
		letter-spacing: 0.32em;
		opacity: 0.7;
	}
	.endcap-text strong {
		display: block;
		font-size: 1rem;
		color: #ffd934;
		margin-top: 0.3rem;
	}

	.inline-video {
		max-width: 880px;
		margin: 2rem auto 0;
	}
	.bubbly-video {
		margin-top: 1.2rem;
	}
</style>
