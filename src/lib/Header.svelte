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

    let headerResolved = $derived(specStore.resolveObject<HeaderObject>(header));
</script>

{#if headerResolved}
    <div class="flex flex-col">
        {#if headerResolved.schema}
            <Schema
                resolutionDepth={1}
                schemaName={name}
                schema={headerResolved.schema}
            />
        {:else if headerResolved.content}
            <span class="text-red-500">Not supported "Content" in headers</span>
        {:else}
            <span class="italic text-gray-500">Nothing here...</span>
        {/if}
        <span class="pl-2 text-sm text-gray-600">
            {headerResolved.description}
        </span>
    </div>
{/if}
