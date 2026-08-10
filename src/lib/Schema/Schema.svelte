<script lang="ts">
    import Schema from "./Schema.svelte"
    import { specStore, type ResolutionResult } from "#lib/stores/Spec.svelte.js";
    import { settings } from "#lib/stores/Settings.svelte.js";
    import { getSchemaAnchor } from "#lib";
    import type { UnresolvedSchema } from "#types";

    interface Props {
        root?: boolean;
        open?: boolean;
        name?: string;
        schema: UnresolvedSchema;
        resolutionDepth?: number;
        parentName?: string;
    }

    let {
        root = true,
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
        if (root || name || resolvedSchema.name) {
            return true;
        }
        return settings.display.showItemsLineOnArray;
    })

    let properties = $derived(Object.entries(resolvedSchema.schema.properties ?? {}))

    function getColorFromResolutionType(type: 'resolved' | 'inline' | 'unresolved' | 'maxDepth'): string {
        switch (type) {
            case 'resolved':
            case 'inline':
            case 'maxDepth': return 'text-gray-500'
            case 'unresolved': return 'text-red-500';
            default: return 'text-gray-400';
        }
    }
</script>

{#snippet ref (r: string | undefined, resolutionType: 'resolved' | 'inline' | 'unresolved' | 'maxDepth')}
    {@const color = getColorFromResolutionType(resolutionType)}
    {#if resolutionType !== 'inline' && r}
        <span class="inline-block text-xs italic {color}">
            {#if resolutionType === 'unresolved'}
                -&rsaquo; {r} (unresolved)
            {:else}
                <a
                    onclick={e => e.stopPropagation()}
                    href="#{getSchemaAnchor(r)}"
                    class="hover:underline"
                >-&rsaquo; {r} {resolutionType === 'maxDepth' ? '(max depth)' : ''}</a>
            {/if}
        </span>
    {/if}
{/snippet}

{#snippet type(schema: ResolutionResult, root = true)}
    <span class="inline-block">
        <span class="text-sm italic font-mono text-blue-700">{schema.schema.type}</span>
        {#if resolvedArrayInnerSchema && root}
            <span class="inline-block text-xs text-gray-600">({@render type(resolvedArrayInnerSchema, false)})</span>
        {/if}
        {@render ref(schema.origin.$ref, schema.resolutionType)}
    </span>
{/snippet}

{#snippet head()}
    <div class="w-full h-full">
        {#if name || resolvedSchema.name}
            <span class="font-mono">{name ?? resolvedSchema.name}</span>
        {:else}
            <span class="font-mono text-sm text-gray-600">Items:</span>
        {/if}
        {@render type(resolvedSchema)}
        {#if parentName && settings.display.showPropertiesPaths}
            <span class="pl-1 text-xs text-gray-400">{fullName}</span>
        {/if}
        {#if resolvedSchema.schema.description}
            <span class="text-xs text-gray-600">{resolvedSchema.schema.description}</span>
        {/if}
        {#if foldable}
            <span class="text-gray-800">{open ? '▲' : '▼'}</span>
        {/if}
    </div>
{/snippet}

<div class="schema w-full font-mono">
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
            <Schema open root={false}
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
                <Schema open root={false}
                    parentName={fullName}
                    name={key} schema={prop}
                    resolutionDepth={newDepth} />
            {/each}
        {/if}
    </div>
</div>
