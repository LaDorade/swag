<script lang="ts">
    import MediaType from "./MediaType.svelte";
    import { specStore } from "./stores/Spec.svelte";
    import { getOperationContext } from "./Operation/OperationContext.svelte";
    import type { ReferenceObject, RequestBodyObject } from "#types/oas.js";

    interface Props {
      requestBody: RequestBodyObject | ReferenceObject;
    }

    let {
      requestBody,
    }: Props = $props()

    const operationContext = getOperationContext()

    let requestBodyResolution = $derived(specStore.evaluate<RequestBodyObject, ReferenceObject>(requestBody));

    let activeMediaType = $derived.by(() => {
        if (!requestBodyResolution.ok) return null
        if (!requestBodyResolution.obj.content) return null;
        return Object.entries(requestBodyResolution.obj.content)[0][0];
    });

    let mediaType: MediaType | null = $state(null);
    operationContext.registerRequestBody(() => requestBodyResolution.ok
        ? requestBodyResolution.obj
        : undefined,
            () => {
            return mediaType?.getMediaTypeContent() ?? null;
        }
    );
</script>

<div class="flex flex-col leading-6">
    {#if requestBodyResolution.ok}
        {@const requestBodyResolved = requestBodyResolution.obj}
        <div class="flex items-center px-2">
            {#if requestBodyResolved.description}
                <span class="leading-6 text-gray-600">{requestBodyResolved.description}</span>
            {:else}
                <span class="leading-6 text-gray-400">-----</span>
            {/if}
            {#if requestBodyResolved.content}
                <select
                    onclick={e => e.stopPropagation()}
                    class="px-2 ml-auto py-1 leading-6 italic border border-gray-300 rounded"
                    bind:value={activeMediaType}
                >
                    {#each Object.entries(requestBodyResolved.content) as [mediaType] (mediaType)}
                        <option value={mediaType}>{mediaType}</option>
                    {/each}
                </select>
            {/if}
        </div>
        {#if requestBodyResolved.content && activeMediaType}
            {@const mediaTypeResolved = requestBodyResolved.content[activeMediaType]}
            <div class="p-2">
                <MediaType
                    bind:this={mediaType}
                    mediaType={mediaTypeResolved}
                    readOnly={!operationContext.tryItOut}
                />
            </div>
        {/if}
    {/if}
</div>
