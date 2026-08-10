<script lang="ts">
    import Schema from "./Schema/Schema.svelte";
    import { specStore } from "./stores/Spec.svelte";
    import { settings } from "./stores/Settings.svelte";
    import type { MediaTypeObject, ReferenceObject } from "#types/oas.js";

    interface Props {
        mediaType: (MediaTypeObject | ReferenceObject);
        open: boolean;
    }

    let {
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

<div class="flex flex-col p-2 leading-6">
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
