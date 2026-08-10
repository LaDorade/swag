<script lang="ts">
    import { specStore } from "./stores/Spec.svelte";
    import type { HeaderObject, ReferenceObject } from "#types/oas.js";
    import Schema from "./Schema/Schema.svelte";

    interface Props {
        header: HeaderObject | ReferenceObject;
        name: string;
    }
    let {
        header,
        name,
    }: Props = $props();

    let headerResolved = $derived.by(() => {
        if ("$ref" in header) {
            const res = specStore.resolve<HeaderObject>(header);
            if (!res.resolved || '$ref' in res.resolved) return null;
            return res.resolved;
        }
        return header;
    });
</script>

{#if headerResolved}
    <div class="flex flex-col">
        {#if headerResolved.schema}
            <Schema
                resolutionDepth={1}
                schemaName={name}
                schema={headerResolved.schema}
            />
        {/if}
        <span class="pl-2 text-sm text-gray-600">
            {headerResolved.description}</span>
    </div>
{/if}
