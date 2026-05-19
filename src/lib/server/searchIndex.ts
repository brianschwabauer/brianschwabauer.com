import type { KVNamespace } from '@cloudflare/workers-types';
import { create, insertMultiple, save, load } from '@orama/orama';
import { listAllPublished, type BlogPost, type BlogPostMeta } from './blog';
import { EMBEDDING_DIM } from './embeddings';
import {
	indexSchema,
	vectorIndexSchema,
	type SearchEntry,
	type VectorSearchEntry
} from '$lib/search';

const INDEX_KEY = '/index.json';
const VECTOR_INDEX_KEY = '/index-vectors.json';

function blogEntry(post: BlogPost | BlogPostMeta): SearchEntry {
	const body = 'contentText' in post && post.contentText ? post.contentText : '';
	return {
		id: `blog:${post.slug}`,
		type: 'blog',
		title: post.title,
		summary: post.summary ?? post.aiSummary ?? '',
		body,
		tags: post.tags,
		date: post.publishedAt ?? post.createdAt,
		url: `/blog/${post.slug}`,
		featuredImage: post.featuredImage ?? null
	};
}

const MEDIA_BASE = 'https://cdn.brianschwabauer.com/media';
const mediaUrl = (name: string) => `${MEDIA_BASE}/${name}`;

const HOME_SECTIONS: SearchEntry[] = [
	{ id: 'home:hero', type: 'home', title: 'Today', summary: 'The current chapter — what I am working on right now.', body: '', tags: ['About', 'Intro', 'Today'], date: Date.now(), url: '/#hero', imageUrl: '/profile_picture2.webp' },
	{ id: 'home:what-im-up-to', type: 'home', title: "What I'm up to", summary: "What I'm building, learning, and shipping right now.", body: '', tags: ['About', 'Current'], date: Date.now(), url: '/#what-im-up-to', imageUrl: mediaUrl('2026-01-01_show_and_tour-dashboard_screenshot-dark_mode_project_page.avif') },
	{ id: 'home:humble-beginnings', type: 'home', title: 'Humble Beginnings', summary: 'A miniDV camera, a bedroom green screen, and a friend named Kevin.', body: '', tags: ['Film', '2006'], date: new Date('2006-01-01').getTime(), url: '/#humble-beginnings', imageUrl: mediaUrl('2006-11-27_the_fight_scene_ii-kevin_and_brian_fight_with_brooms_and_shovels_3.avif') },
	{ id: 'home:green-screen', type: 'home', title: 'Green Screen', summary: 'Painting a wall green and learning compositing.', body: '', tags: ['Film', 'VFX', '2007'], date: new Date('2007-01-01').getTime(), url: '/#green-screen', imageUrl: mediaUrl('2007-08-09_xyz_news_episode_i-brian_gives_thumbs_up_while_floating_with_green_screen.avif') },
	{ id: 'home:power-rangers', type: 'home', title: 'Power Rangers', summary: 'Backyard fight choreography, costumes, and the Power Rangers fan film phase.', body: '', tags: ['Film', 'Fan Film', '2008'], date: new Date('2008-01-01').getTime(), url: '/#power-rangers', imageUrl: mediaUrl('2007-06-16_power_rangers_360-premiere-power_rangers_group_photo_1.jpg') },
	{ id: 'home:taking-it-seriously', type: 'home', title: 'First Websites', summary: 'The first websites — taking the work seriously.', body: '', tags: ['Web', '2009'], date: new Date('2009-01-01').getTime(), url: '/#taking-it-seriously', imageUrl: mediaUrl('2009-01-01_hunky_spunky_productions_website_scroll.avif') },
	{ id: 'home:music-videos', type: 'home', title: 'Music Videos', summary: 'Shooting and editing music videos.', body: '', tags: ['Film', 'Music Video', '2010'], date: new Date('2010-01-01').getTime(), url: '/#music-videos', imageUrl: mediaUrl('2010-03-25_do_da_flava_g-whole_family_dances_in_back_yard.avif') },
	{ id: 'home:animation', type: 'home', title: 'Animation & VFX', summary: 'Compositing, motion graphics, and visual effects.', body: '', tags: ['Film', 'Animation', 'VFX', '2011'], date: new Date('2011-01-01').getTime(), url: '/#animation', imageUrl: mediaUrl('2011-03-01_exposure-animated_on_transparent_background_camera_robot_transforms_from_camera_to_robot.avif') },
	{ id: 'home:festivals-ksms', type: 'home', title: 'Festivals & KSMS', summary: 'Film festivals and Kalamazoo School for the Arts.', body: '', tags: ['Film', 'Festival', '2011'], date: new Date('2011-06-01').getTime(), url: '/#festivals-ksms', imageUrl: mediaUrl('2011-04-14_this_is_ksms-basketball_trick_shot_with_vfx.avif') },
	{ id: 'home:spunksters', type: 'home', title: 'The Spunksters', summary: 'The Spunksters — short films and creative experiments.', body: '', tags: ['Film', '2013'], date: new Date('2013-01-01').getTime(), url: '/#spunksters', imageUrl: mediaUrl('2013-06-22_the_spunksters-logo_animation.avif') },
	{ id: 'home:college', type: 'home', title: 'College', summary: 'College years — film school and finding my voice.', body: '', tags: ['About', 'College', '2014'], date: new Date('2014-01-01').getTime(), url: '/#college', imageUrl: mediaUrl('2012-04-27_facebook_short_film-zolly_shot_of_main_character_falling_in_love.avif') },
	{ id: 'home:what-makes-us-human', type: 'home', title: 'Senior Thesis: What Makes Us Human', summary: 'Senior thesis film — what makes us human.', body: '', tags: ['Film', 'Thesis', '2015'], date: new Date('2015-01-01').getTime(), url: '/#what-makes-us-human', imageUrl: mediaUrl('2014-06-04_what_makes_us_human-main_character_stuck_in_high_tech_jail_cell_visual_effect.avif') },
	{ id: 'home:freelancer', type: 'home', title: 'Freelancer', summary: 'Freelance work — film, web, and design.', body: '', tags: ['Work', 'Freelance', '2017'], date: new Date('2017-01-01').getTime(), url: '/#freelancer', imageUrl: mediaUrl('2015-08-24_brian_demo_reel_2015-logo_animation_over_sunset_timelapse.avif') },
	{ id: 'home:entrepreneurship', type: 'home', title: 'Entrepreneurship', summary: 'Starting things — the entrepreneurial chapter.', body: '', tags: ['Work', 'Startup', '2019'], date: new Date('2019-01-01').getTime(), url: '/#entrepreneurship', imageUrl: mediaUrl('2016-01-01_tower_of_the_americas_panorama-little_planet.avif') },
	{ id: 'home:showandtour', type: 'home', title: 'Show&Tour', summary: 'Building Show&Tour — the company.', body: '', tags: ['Work', 'Showandtour', 'Startup', '2024'], date: new Date('2024-01-01').getTime(), url: '/#showandtour', imageUrl: mediaUrl('2026-01-01_show_and_tour-property_website_screenshot-prairievillageestate.avif') },
	{ id: 'home:side-projects', type: 'home', title: 'Side Projects', summary: 'Side projects and personal experiments.', body: '', tags: ['Work', 'Side Projects', '2026'], date: new Date('2026-01-01').getTime(), url: '/#side-projects', imageUrl: mediaUrl('2026-01-01_ghtui_screen_recording.avif') }
];

async function loadFullPosts(kv: KVNamespace): Promise<BlogPost[]> {
	const metas = await listAllPublished(kv);
	const fulls = await Promise.all(
		metas.map((m) => kv.get(`/blog/${m.slug}.json`, 'json') as Promise<BlogPost | null>)
	);
	return fulls.filter((p): p is BlogPost => p !== null);
}

export async function rebuildIndex(kv: KVNamespace): Promise<void> {
	const db = create({ schema: indexSchema });
	const posts = await loadFullPosts(kv);
	const entries: SearchEntry[] = [...posts.map(blogEntry), ...HOME_SECTIONS];
	if (entries.length > 0) {
		await insertMultiple(db, entries as unknown as Record<string, unknown>[]);
	}
	await kv.put(INDEX_KEY, JSON.stringify(save(db)));
}

export async function rebuildVectorIndex(kv: KVNamespace): Promise<void> {
	const db = create({ schema: vectorIndexSchema });
	const posts = await loadFullPosts(kv);
	const entries: VectorSearchEntry[] = posts
		.filter((p) => p.embedding && p.embedding.length === EMBEDDING_DIM)
		.map((p) => ({
			id: `blog:${p.slug}`,
			type: 'blog',
			title: p.title,
			summary: p.summary ?? p.aiSummary ?? '',
			tags: p.tags,
			date: p.publishedAt ?? p.createdAt,
			url: `/blog/${p.slug}`,
			embedding: p.embedding as number[],
			featuredImage: p.featuredImage ?? null
		}));
	if (entries.length > 0) {
		await insertMultiple(db, entries as unknown as Record<string, unknown>[]);
	}
	await kv.put(VECTOR_INDEX_KEY, JSON.stringify(save(db)));
}

export async function readPersistedIndex(kv: KVNamespace): Promise<string | null> {
	return kv.get(INDEX_KEY);
}

export async function readPersistedVectorIndex(kv: KVNamespace): Promise<string | null> {
	return kv.get(VECTOR_INDEX_KEY);
}

export function restoreVectorIndex(persisted: string) {
	const db = create({ schema: vectorIndexSchema });
	load(db, JSON.parse(persisted));
	return db;
}
