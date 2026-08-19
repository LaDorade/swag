<script lang="ts">
    import WithExample from "./WithExample.svelte";
    import { specStore } from "./stores/Spec.svelte";

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
        <WithExample {schema} {examples} />
    {:else}
        <span class="italic text-gray-500">Unresolved Media type</span>
    {/if}
</div>
