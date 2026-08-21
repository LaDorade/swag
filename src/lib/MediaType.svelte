<script lang="ts">
    import WithExample from "./Example/WithExample.svelte";
    import { specStore } from "./stores/Spec.svelte";

    import type { MediaTypeObject, ReferenceObject } from "#types/oas.js";

    interface Props {
        mediaType: (MediaTypeObject | ReferenceObject);
        readOnly?: boolean;
    }

    let {
        mediaType,
        readOnly = true,
    }: Props = $props();

    let mediaTypeResolution = $derived(specStore.evaluate<MediaTypeObject>(mediaType));

    let withExample: WithExample | null = $state(null);
    export function getMediaTypeContent(): string | null {
        return withExample?.getEditorContent() ?? null;
    }
</script>

<div class="mediaType flex flex-col gap-2 leading-6">
    {#if mediaTypeResolution.ok}
        {@const { schema, examples } = mediaTypeResolution.obj}
        <WithExample
            bind:this={withExample}
            {readOnly}
            {schema} {examples}
        />
    {:else}
        <span class="italic text-gray-500">Unresolved Media type</span>
    {/if}
</div>
