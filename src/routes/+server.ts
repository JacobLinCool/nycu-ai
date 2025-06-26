import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request }) => {
	const acceptLanguage = request.headers.get('accept-language') || '';

	// Parse accept-language header to get preferred languages
	const languages = acceptLanguage
		.split(',')
		.map((lang) => {
			const [code, q = '1'] = lang.trim().split(';q=');
			return {
				code,
				quality: parseFloat(q)
			};
		})
		.sort((a, b) => b.quality - a.quality); // Sort by quality (preference)

	const targetLanguage = languages.length > 0 ? languages[0].code : 'en';
	throw redirect(302, `/${targetLanguage}`);
};
