<script lang="ts">
	import { Languages, CircleX } from '@lucide/svelte';
	import { Toast } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	const myAddress = 'jacob.cs14@nycu.edu.tw';

	interface Props {
		data: {
			disclaimer: string;
			aboutThisDomain: string;
			welcomeMessage: string;
			anyIdeas: string;
			reachOut: string;
			error?: string;
			model?: string;
		};
	}

	let { data }: Props = $props();
	let showToasts = $state(true);

	onMount(() => {
		if (data.error || data.model) {
			setTimeout(() => {
				showToasts = false;
			}, 5_000);
		}
	});
</script>

<svelte:head>
	<title>NYCU.AI</title>
	<meta name="description" content={data.welcomeMessage} />
</svelte:head>

<section class="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4 py-32">
	<div class="mx-auto w-full max-w-4xl text-center">
		<h1
			class="from-primary-500 via-primary-600 to-primary-600 mb-6 bg-gradient-to-t bg-clip-text text-6xl font-bold text-transparent md:text-8xl"
		>
			NYCU.AI
		</h1>
		<p class="mb-12 text-lg font-semibold text-gray-300 md:text-xl">
			{data.disclaimer}
		</p>

		<div class="mx-auto max-w-3xl rounded-lg bg-gray-800 p-8 shadow-xl">
			<h2 class="mb-6 text-3xl font-bold text-white">{data.aboutThisDomain}</h2>
			<div class="space-y-4 text-left text-gray-300">
				<p class="text-lg">
					{data.welcomeMessage}
				</p>
				<p>
					{data.anyIdeas}
				</p>
				<p>
					{data.reachOut}
					<a
						href="mailto:{myAddress}"
						class="text-secondary-400 hover:text-secondary-300 mt-2 inline-block transition-colors"
					>
						{myAddress}
					</a>
				</p>
			</div>
		</div>
	</div>
</section>

{#if data.error || data.model}
	<div class="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
		{#if data.error}
			<Toast color="red" dismissable={false} bind:toastStatus={showToasts}>
				<span class="flex items-center">
					<CircleX class="mr-2 h-4 w-4" />
					{data.error}
				</span>
			</Toast>
		{/if}
		{#if data.model}
			<Toast color="green" dismissable={false} bind:toastStatus={showToasts}>
				<span class="flex items-center">
					<Languages class="mr-2 h-4 w-4" />
					{data.model}
				</span>
			</Toast>
		{/if}
	</div>
{/if}
