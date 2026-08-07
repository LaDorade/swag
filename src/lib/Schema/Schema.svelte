<script lang="ts">
    import Schema from "./Schema.svelte"
    import { specStore } from "#lib/stores/Spec.svelte.js";
    import { settings } from "#lib/stores/Settings.svelte.js";
    import { deduceSchemaType, getSchemaAnchor } from "#lib";
    import type { UnresolvedSchema } from "#types";

    interface Props {
        open?: boolean;
        name?: string;
        schema: UnresolvedSchema;
        resolutionDepth?: number;
        parentName?: string;
    }

    let {
        name,
        schema: s,
        open = $bindable(false),
        resolutionDepth = 0,
        parentName
    }: Props = $props();

    let fullName = $derived.by(() => {
        if (!parentName) {
            return name;
        }
        if (!name) {
            return parentName;
        }
        return `${parentName}.${name}`
    })

    let resolvedSchema = $derived(specStore.resolveSchema(s, resolutionDepth))


    let shouldResolveInnerSchema = $derived.by(() => {
        if (resolvedSchema?.resolutionType === 'resolved'){
            if (resolutionDepth <= 1) {
                return settings.resolution.alwaysResolveArraySubSchema;
            }
        } else if (resolvedSchema?.resolutionType === 'inline'){
            if (resolutionDepth <= 0) {
                return settings.resolution.alwaysResolveArraySubSchema;
            }
        }
        return resolvedSchema.resolved;
    })
    // If we resolved an array, we want to resolve its inner type too
    // Special case when the array is declared inline but the inner type is a $ref
    let resolvedArrayInnerSchema = $derived(
        resolvedSchema.schema.items
        ? specStore.resolveSchema(resolvedSchema.schema.items,
            shouldResolveInnerSchema ? 1 : 0)
        : null
    )
    // Inline ARE in the schema, so we dont count them
    let newDepth = $derived.by(() => {
        let depth = resolutionDepth - 1;
        if (resolvedSchema.resolutionType === 'inline') {
            depth += 1;
        }
        return Math.max(depth, 0);
    })
    let newDepthInnerArray = $derived.by(() => {
        let depth = newDepth - 1;
        // Special case of inline schema array with inline subSchema
        if (settings.resolution.alwaysResolveArraySubSchema
            || (resolvedSchema.resolutionType === 'inline'
                && resolvedArrayInnerSchema?.resolutionType === 'inline')) {
            depth += 1;
        }
        return Math.max(depth, 0);
    })

    // Foldable only if inner properties
    // Not based on type because of degenerate values like
    // type: 'string'
    // properties: {...}
    // items: {...}
    let foldable = $derived(
        resolvedSchema.schema.properties
        || (resolvedSchema.schema.items
            && (settings.display.showItemsLineOnArray
                || (resolvedArrayInnerSchema?.resolved
                    && resolvedArrayInnerSchema.schema.properties)))
    )

    // Dont render head (infos) objects with no name (likely only referenced in array)
    let renderHead = $derived.by(() => {
        if (name) {
            return true;
        }
        return settings.display.showItemsLineOnArray;
    })

    let schemaType = $derived(deduceSchemaType(resolvedSchema.schema))
    let properties = $derived(Object.entries(resolvedSchema.schema.properties ?? {}))
</script>

{#snippet ref (r: string)}
    <a onclick={e => e.stopPropagation()} href="#{getSchemaAnchor(r)}"
        class="hover:underline">{r}</a>
{/snippet}

{#snippet head()}
    <div class="w-full h-full px-1 py-0.5">
        {#if name}
            <span class="font-mono">{name}</span>
        {:else}
            <span class="font-mono text-sm text-gray-600">Items:</span>
        {/if}
        {#if resolvedSchema.resolved}
            {#if resolvedSchema.resolutionType === 'resolved' && resolvedSchema.origin.$ref}
                <span class="text-xs italic text-gray-500">-&rsaquo; {@render ref(resolvedSchema.origin.$ref)}</span>
            {/if}
            {#if schemaType}
                <span class="text-sm italic font-mono text-blue-700">
                    {schemaType}{#if resolvedArrayInnerSchema}
                        ({#if resolvedArrayInnerSchema.origin.$ref}
                            <span class="text-xs italic text-gray-500">
                                -&rsaquo; {@render ref(resolvedArrayInnerSchema.origin.$ref)}
                            </span>{#if resolvedArrayInnerSchema.schema.type}
                                {' ' + resolvedArrayInnerSchema.schema.type})
                            {:else}){/if}
                        {:else}
                            {resolvedArrayInnerSchema.schema.type})
                        {/if}
                    {/if}
                </span>
            {/if}
            {#if resolvedSchema.schema.format}
                <span class="text-xs font-mono text-gray-700">({resolvedSchema.schema.format})</span>
            {/if}
        {:else if resolvedSchema.resolutionType === 'maxDepth'}
            <span class="text-xs italic text-gray-500">
                -&rsaquo; {@render ref(resolvedSchema.origin.$ref)} (max depth)</span>
        {:else if resolvedSchema.resolutionType === 'unresolved'}
            <span class="text-xs italic text-red-800">
                -&rsaquo; {resolvedSchema.schema.$ref} (unresolved)</span>
        {/if}
        {#if parentName && settings.display.showPropertiesPaths}
            <span class="pl-1 text-xs text-gray-400">{fullName}</span>
        {/if}
        {#if foldable}
            <span class="text-gray-800">{open ? '▲' : '▼'}</span>
        {/if}
    </div>
{/snippet}

<div class="w-full font-mono">
    {#if renderHead}
        {#if foldable}
            <button
                class="w-full text-left cursor-pointer hover:bg-gray-200 rounded"
                onclick={() => (open = !open)}
            >
                {@render head()}
            </button>
        {:else}
            {@render head()}
        {/if}
    {/if}

    <div
        class:hidden={!open}
        class="flex flex-col gap-0
            {renderHead ? 'ml-2 pl-2 border-l border-gray-200 hover:border-gray-400' : ''}
        ">
        <!--// Not based on type because of degenerate values like
            // type: 'string'
            // properties: {...}
            // items: {...} -->
        {#if resolvedArrayInnerSchema?.resolved}
            <Schema open
                schema={resolvedArrayInnerSchema.schema}
                resolutionDepth={newDepthInnerArray}
                parentName="{fullName}[i]"
                />
        {/if}
        <!--// Not based on type because of degenerate values like
            // type: 'string'
            // properties: {...}
            // items: {...} -->
        {#if properties.length}
            {#each properties as [key, prop] (key)}
                <Schema open
                    parentName={fullName}
                    name={key} schema={prop}
                    resolutionDepth={newDepth} />
            {/each}
        {/if}
    </div>
</div>
