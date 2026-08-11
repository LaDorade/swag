<script lang="ts">
    import { specStore } from "./stores/Spec.svelte";
    import MediaType from "./MediaType.svelte";
    import Headers from "./Headers.svelte";
    import type { ReferenceObject, ResponseObject } from "#types/oas.js";

    interface Props {
        response: ( ResponseObject | ReferenceObject)& {
            code: string;
        },
        open?: boolean;
    }

    let {
        response,
        open = $bindable(false)
    }: Props = $props()

    let responseResolved = $derived(specStore.resolveObject<ResponseObject>(response));

    let activeMediaType = $derived.by(() => {
        if (!responseResolved?.content) return null;
        return Object.entries(responseResolved.content)[0][0];
    });

    let foldable = $derived(
        Boolean(responseResolved?.summary
            || responseResolved?.content
            || responseResolved?.headers)
    )
</script>

<details bind:open class="border-gray-300">
    <summary class="leading-6 text-left w-full flex items-baseline gap-2 rounded overflow-hidden">
        <span class="font-bold">{response.code}</span>
        <i class="px-0.5 text-xs text-gray-600 italic truncate">{response.description}</i>
        {#if responseResolved?.content}
            <select
                class="ml-auto px-2 py-1 leading-6 italic border border-gray-300 rounded"
                bind:value={activeMediaType}
                disabled={!foldable || Object.keys(responseResolved.content).length === 0}
            >
                {#each Object.entries(responseResolved.content) as [mediaType] (mediaType)}
                    <option value={mediaType}>{mediaType}</option>
                {/each}
            </select>
        {/if}
        {#if foldable}
            <span class="px-2 text-gray-600">{open ? '▲' : '▼'}</span>
        {/if}
    </summary>
    {#if foldable}
        {#if responseResolved?.content && activeMediaType}
            {@const mediaTypeResolved = responseResolved.content[activeMediaType]}
            <MediaType
                title={activeMediaType}
                mediaType={mediaTypeResolved}
                {open}
            />
        {/if}
        {#if responseResolved?.headers}
            <Headers headers={responseResolved.headers} />
        {/if}
    {/if}
</details>
