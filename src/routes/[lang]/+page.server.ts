import { GoogleGenAI, Type } from '@google/genai';
import { env } from '$env/dynamic/private';

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

const translationCache = new Map<string, Promise<Record<string, string>>>();

export const load = async ({ params }) => {
	const lang = params.lang;

	const en = {
		disclaimer:
			'This site is not officially affiliated with National Yang Ming Chiao Tung University.',
		aboutThisDomain: 'About This Domain',
		welcomeMessage:
			"Welcome! I recently registered this domain after discovering it was available on Cloudflare. While I haven't decided on a specific purpose yet, I hope to see it become a hub for inspiring and impactful AI projects.",
		anyIdeas:
			"If you have creative ideas for open source AI initiatives, I'd love to hear from you—and I'm happy to offer a free subdomain to help bring your vision to life!",
		reachOut: 'Feel free to reach out anytime at:'
	};

	if (lang.trim().toLowerCase() === 'en') {
		return { ...en };
	}

	let shouldTranslate = false;
	if (!translationCache.has(lang)) {
		shouldTranslate = true;
	} else {
		const cached = await translationCache.get(lang);
		shouldTranslate = !!(cached && cached.error);
	}
	if (shouldTranslate) {
		translationCache.set(
			lang,
			(async () => {
				console.log(`Translating content to ${lang}...`);
				const config = {
					responseMimeType: 'application/json',
					responseSchema: {
						type: Type.OBJECT,
						required: ['translated'],
						properties: {
							translated: {
								type: Type.OBJECT,
								required: [
									'disclaimer',
									'aboutThisDomain',
									'welcomeMessage',
									'anyIdeas',
									'reachOut'
								],
								properties: {
									disclaimer: {
										type: Type.STRING
									},
									aboutThisDomain: {
										type: Type.STRING
									},
									welcomeMessage: {
										type: Type.STRING
									},
									anyIdeas: {
										type: Type.STRING
									},
									reachOut: {
										type: Type.STRING
									}
								}
							}
						}
					},
					systemInstruction: [
						{
							text: `You are a proficient translator that translates the i18n content from English to language \`${lang}\`.`
						}
					]
				};
				const models = [
					{
						name: 'gemini-2.5-flash',
						weight: 250
					},
					{
						name: 'gemini-2.5-flash-lite-preview-06-17',
						weight: 1000
					},
					{
						name: 'gemini-2.0-flash',
						weight: 200
					},
					{
						name: 'gemini-2.0-flash-lite',
						weight: 200
					}
				];
				const model = pickModel(models);
				console.log(`Selected model: ${model}`);
				const contents = [
					{
						role: 'user',
						parts: [
							{
								text: `English: ${JSON.stringify(en, null, 2)}`
							}
						]
					}
				];

				const response = await ai.models.generateContent({
					model,
					config,
					contents
				});

				console.log(`Translation response: ${response.text}`);
				if (!response.text) {
					return { error: 'Failed to generate content', ...en };
				}

				const content = JSON.parse(response.text);
				return { ...content.translated, model };
			})()
		);
	}

	return translationCache.get(lang) ?? { error: 'Translation not available', ...en };
};

function pickModel(models: { name: string; weight: number }[]): string {
	const totalWeight = models.reduce((sum, model) => sum + model.weight, 0);
	let random = Math.random() * totalWeight;
	for (const model of models) {
		if (random < model.weight) {
			return model.name;
		}
		random -= model.weight;
	}
	return models[0].name; // fallback
}
