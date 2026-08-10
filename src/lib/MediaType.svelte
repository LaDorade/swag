<script lang="ts">
    import Schema from "./Schema/Schema.svelte";
    import { specStore } from "./stores/Spec.svelte";
    import { settings } from "./stores/Settings.svelte";
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

    let mediaTypeResolved = $derived.by(() => {
        // TODO: make this generic between all referencable objects
        if ('$ref' in mediaType) {
            const res = specStore.resolve<MediaTypeObject>(mediaType);
            // FIXME: handle multiples ref
            if (!res.resolved || '$ref' in res.resolved) return null;
            return res.resolved;
        }
        return mediaType;
    })
</script>

<div class="flex flex-col gap-2 p-2 leading-6">
    {#if title}
        <h3 class="text-base font-bold border-b border-gray-200 w-fit">{title}</h3>
    {/if}
    {#if mediaTypeResolved?.schema}
        <Schema
            resolutionDepth={settings.resolution.schemaMaxResolutionDepth}
            schema={mediaTypeResolved.schema}
            open={open}
        />
    {:else}
        <span class="p-2 leading-6 text-gray-600">None</span>
    {/if}
</div>
