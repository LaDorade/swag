
<script lang="ts">
    import type {
        ExampleObject,
        ReferenceObject
    } from "#types/oas.js";
    import Example from "./Example.svelte";


    interface Props {
        examples: Record<string, ExampleObject | ReferenceObject | null>;
    }

    let {
        examples,
    }: Props = $props();

    let activeExample: string | null = $derived(Object.keys(examples)[0] ?? null)
</script>

<div class="flex flex-col leading-6">
    <div class="flex items-center">
        {#if activeExample}
            {@const example = examples[activeExample]}
            {#if example?.description}
                <span class="italic text-gray-500">{example.description}</span>
            {/if}
        {/if}
        <span class="w-full border-b border-gray-200 mr-2"> </span>
        <div class="ml-auto flex items-baseline gap-2">
            <span>Examples:</span>
            <select
                class="px-2 py-1 leading-6 italic border border-gray-300 rounded"
                bind:value={activeExample}
            >
                {#each Object.keys(examples) as example (example)}
                    <option value={example}>{example}</option>
                {/each}
            </select>
        </div>
    </div>
    {#if activeExample}
        {@const example = examples[activeExample]}
        <div class="mt-4">
            <Example name={activeExample} {example} />
        </div>
    {/if}
</div>
