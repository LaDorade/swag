<script lang="ts">
    import Schema from "./Schema/Schema.svelte";
    import { specStore } from "./stores/Spec.svelte";
    import { settings } from "./stores/Settings.svelte";
    import Examples from "./Examples.svelte";
    import type { MediaTypeObject, ReferenceObject } from "#types/oas.js";

    interface Props {
        title?: string;
        mediaType: (MediaTypeObject | ReferenceObject);
        open: boolean;
    }

    let {
        title,
        mediaType,
        open,
    }: Props = $props();

    let mediaTypeResolution = $derived(specStore.evaluate<MediaTypeObject>(mediaType));
</script>

<div class="mediaType flex flex-col gap-2 leading-6">
    {#if mediaTypeResolution.ok}
        {@const { schema, examples } = mediaTypeResolution.obj}
        {#if title}
            <h3 class="text-base font-bold border-b border-gray-200 w-fit">{title}</h3>
        {/if}
        {#if schema}
            <Schema
                resolutionDepth={settings.resolution.schemaMaxResolutionDepth}
                schema={schema}
                open={open}
            />
        {:else}
            <span class="italic text-gray-500">Nothing here...</span>
        {/if}
        {#if examples}
            <Examples examples={examples} />
        {/if}
    {:else}
        <span class="italic text-gray-500">Unresolved Media type</span>
    {/if}
</div>
