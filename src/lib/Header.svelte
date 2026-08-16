<script lang="ts">
    import { specStore } from "./stores/Spec.svelte";
    import Schema from "./Schema/Schema.svelte";
    import type { HeaderObject, ReferenceObject } from "#types/oas.js";

    interface Props {
        header: HeaderObject | ReferenceObject;
        name: string;
    }
    let {
        header,
        name,
    }: Props = $props();

    let headerResolution = $derived(specStore.evaluate<HeaderObject>(header));
</script>

{#if headerResolution.ok}
    {@const resolvedHeader = headerResolution.obj}
    <div class="flex flex-col">
        {#if resolvedHeader.schema}
            <Schema
                resolutionDepth={1}
                schemaName={name}
                schema={resolvedHeader.schema}
            />
        {:else if resolvedHeader.content}
            <span class="text-red-500">Not supported "Content" in headers</span>
        {:else}
            <span class="italic text-gray-500">Nothing here...</span>
        {/if}
        <span class="pl-2 text-sm text-gray-600">
            {resolvedHeader.description}
        </span>
    </div>
{/if}
