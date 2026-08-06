<script lang="ts">
    import { specStore } from "#lib/stores/Spec.svelte.js";
    import ResolvedSchema from "./ResolvedSchema.svelte"
    import type { UnresolvedSchema } from "#types";

    interface Props {
        open?: boolean;
        name?: string;
        schema: UnresolvedSchema;
        resolutionDepth?: number;
    }

    let {
        name,
        schema,
        resolutionDepth = 0,
        open = $bindable(false)
    }: Props = $props()

    let result = $derived(specStore.resolveSchema(schema, resolutionDepth))

    console.log(result);
</script>

{#if result.type === 'maxDepth' && name}
    <span>{name} /maxDepth/ $ref: {result.schema.$ref}</span>
{:else if result.type === 'unresolved'}
    <span class="text-red-800">{name} /unresolved/ $ref: {result.schema.$ref}</span>
{:else}
    <!-- Only reduce resolutionDepth on resolved reference -->
    <ResolvedSchema
        {open}
        {name}
        schema={result.schema}
        resolutionDepth={result.type === 'inline' ? resolutionDepth : resolutionDepth - 1} />
{/if}
