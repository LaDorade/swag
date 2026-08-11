<script lang="ts">
    import MediaType from "./MediaType.svelte";
    import { specStore } from "./stores/Spec.svelte";
    import type { ReferenceObject, RequestBodyObject } from "#types/oas.js";

    interface Props {
      requestBody: RequestBodyObject | ReferenceObject;
      open?: boolean;
    }

    let {
      requestBody,
      open = $bindable(false)
    }: Props = $props()

    let requestBodyResolved = $derived(specStore.resolveObject<RequestBodyObject>(requestBody));

    let activeMediaType = $derived.by(() => {
        if (!requestBodyResolved?.content) return null;
        return Object.entries(requestBodyResolved.content)[0][0];
    });

</script>

<div class="flex flex-col leading-6">
    <div class="flex items-center">
        {#if requestBodyResolved?.description}
            <span class="px-2 leading-6 text-gray-600">{requestBodyResolved.description}</span>
        {:else}
            <span class="px-2 leading-6 text-gray-400">-----</span>
        {/if}
        {#if requestBodyResolved?.content}
            <select
                class="ml-auto px-2 py-1 leading-6 italic border border-gray-300 rounded"
                bind:value={activeMediaType}
            >
                {#each Object.entries(requestBodyResolved.content) as [mediaType] (mediaType)}
                    <option value={mediaType}>{mediaType}</option>
                {/each}
            </select>
        {/if}
    </div>
    {#if requestBodyResolved?.content && activeMediaType}
        {@const mediaTypeResolved = requestBodyResolved.content[activeMediaType]}
        <div class="flex flex-col">
            <MediaType
                mediaType={mediaTypeResolved}
                open={open}
            />
        </div>
    {/if}
</div>
