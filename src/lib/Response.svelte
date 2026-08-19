<script lang="ts">
    import { specStore } from "./stores/Spec.svelte";
    import MediaType from "./MediaType.svelte";
    import Headers from "./Headers.svelte";
    import type { ReferenceObject, ResponseObject } from "#types/oas.js";

    interface Props {
        response: (ResponseObject | ReferenceObject) & {
            code: string;
        },
        open?: boolean;
    }

    let {
        response,
        open = $bindable(false)
    }: Props = $props()

    let responseResolution = $derived(specStore.evaluate<ResponseObject>(response));

    let activeMediaType = $derived.by(() => {
        if (!responseResolution.ok) return null;
        if (!responseResolution.obj.content) return null;
        return Object.entries(responseResolution.obj.content)[0]?.[0] ?? null;
    });

    let foldable = $derived.by(() => {
        if (!responseResolution.ok) return false;

        return Boolean(
               responseResolution.obj.summary
            || responseResolution.obj.content
            || responseResolution.obj.headers)
    })
</script>

{#if responseResolution.ok}
    {@const responseResolved = responseResolution.obj}
    <details bind:open class="flex flex-col leading-6">
        <summary class="flex items-center px-2 {foldable ? 'cursor-pointer' : ''}">
            <div class="flex gap-2 items-baseline">
                <span class="font-bold leading-6 text-gray-700 font-mono">{response.code}</span>
                {#if response?.description}
                    <span class="leading-6 text-gray-600">{response.description}</span>
                {/if}
                {#if foldable}
                    <span class="text-gray-600">{open ? '▲' : '▼'}</span>
                {/if}
            </div>
            {#if responseResolved.content}
                <select
                    onclick={e => e.stopPropagation()}
                    class="px-2 ml-auto py-1 leading-6 italic border border-gray-300 rounded"
                    bind:value={activeMediaType}
                >
                    {#each Object.entries(responseResolved.content) as [mediaType] (mediaType)}
                        <option value={mediaType}>{mediaType}</option>
                    {/each}
                </select>
            {/if}
        </summary>
        {#if foldable}
            <div class="p-2">
                {#if responseResolved.content && activeMediaType}
                    {@const mediaTypeResolved = responseResolved.content[activeMediaType]}
                    <MediaType
                        title={'Content: ' + activeMediaType}
                        mediaType={mediaTypeResolved}
                        {open}
                    />
                {/if}
                {#if responseResolved.headers}
                    <Headers headers={responseResolved.headers} />
                {/if}
            </div>
        {/if}
    </details>
{/if}
