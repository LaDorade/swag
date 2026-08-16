<script lang="ts">
    import Schema from "./Schema.svelte"
    import Type from "./Type.svelte";
    import { specStore } from "#lib/stores/Spec.svelte.js";
    import { settings } from "#lib/stores/Settings.svelte.js";
    import { deduceSchemaType } from "..";

    import type { ResolvedSchema, UnresolvedSchema } from "#types";
    import type { Snippet } from "svelte";

    interface Props {
        root?: boolean;
        open?: boolean
        /**
         * null -> dont want to show name at all
         * undefined -> try to deduce it
         * string -> use that
         */
        schemaName?: string | null;
        schema: UnresolvedSchema;
        resolutionDepth?: number;
        parentName?: string | null;
        // lang?: 'json' | 'yaml' | 'xml' | 'text',
        beforeName?: Snippet;
    }

    let {
        root = true,
        schemaName,
        schema: s,
        open = $bindable(false),
        resolutionDepth = 0,
        parentName,
        // lang = 'json',
        beforeName,
    }: Props = $props();

    let resolvedSchema = $derived(specStore.evaluate<ResolvedSchema, UnresolvedSchema>(s, resolutionDepth > 0))
    let deductedType = $derived(deduceSchemaType(resolvedSchema.obj))
    let newDepth = $derived(specStore._newDepth(resolutionDepth, resolvedSchema.status))

    /*
     * Inner Schema (array only for now)
     * Used only for type display
     */
    let innerSchema = $derived.by(() => {
        if (!resolvedSchema.ok) return null;
        if (!resolvedSchema.obj.items) return null;

        const shouldResolveInnerRef = specStore._shouldResolveArraySubSchema(resolvedSchema, resolutionDepth);
        const resolvedArrayInnerSchema = specStore.evaluate(resolvedSchema.obj.items, shouldResolveInnerRef)

        return {
            resolution: resolvedArrayInnerSchema,
            type: deduceSchemaType(resolvedArrayInnerSchema.obj),
            ref: resolvedArrayInnerSchema.origin.$ref,
            newDepth: specStore._newInnerArrayDepth(newDepth,
                resolvedSchema.status,
                resolvedArrayInnerSchema.status)
        }
    })

    /* Display */
    // Foldable only if inner properties
    // Not based on type because of degenerate values like
    // type: 'string'
    // properties: {...}
    // items: {...}
    let foldable = $derived(
        // true ||
        resolvedSchema.obj.properties
        || (resolvedSchema.obj.items
            && (settings.display.showItemsLineOnArray
                || innerSchema?.resolution.obj.properties))
    )
    // Two cases where schema doesnt have name
    // 1. Schema in array
    // 2. Schema declared inline in requestBodies or responses
    let name = $derived.by(() => {
        if (schemaName === null) return null
        return schemaName ?? resolvedSchema.name ?? null
    })
    let fullName = $derived.by(() => {
        if (!parentName) return name;
        if (!name) return parentName;

        return `${parentName}.${name}`
    })
    let renderHead = $derived.by(() => {
        if (root || name) return true;
        // FIXME: Render head when inner schema has desc/default/examples/...
        return settings.display.showItemsLineOnArray;
    })

</script>

{#snippet head()}
    <div class="flex flex-col gap-1">
        <div class="w-full h-full">
            {@render beforeName?.()}
            {#if name}
                <span class="inline-block font-mono">{name}</span>
            {/if}
            <Type
                rootData={{
                    type: deductedType,
                    ref: resolvedSchema.origin.$ref,
                    resolutionStatus: resolvedSchema.status,
                }} innerData={innerSchema
                    ? {
                        type: innerSchema.type,
                        ref: innerSchema.ref,
                        resolutionStatus: innerSchema.resolution.status,
                    }
                    : null}
            />
            {#if parentName && settings.display.showPropertiesPaths}
                <span class="pl-1 text-xs text-gray-400">{fullName}</span>
            {/if}
            {#if foldable}
                <span class="text-gray-800">{open ? '▲' : '▼'}</span>
            {/if}
        </div>
        {#if resolvedSchema.obj.description}
            <span class="pl-2 text-xs text-gray-600">
                desc: {resolvedSchema.obj.description}</span>
        {/if}
        {#if resolvedSchema.obj.examples}
            <span class="pl-2 text-xs text-gray-600">
                examples: {Object.values(resolvedSchema.obj.examples).join(', ')}</span>
        {/if}
        {#if resolvedSchema.obj.default}
            <span class="pl-2 text-xs text-gray-600">
                default: {resolvedSchema.obj.default}</span>
        {/if}
    </div>
{/snippet}

<div class="schema w-full font-mono flex flex-col">
    {#if renderHead}
        {#if foldable}
            <button class="text-left w-full cursor-pointer
                px-2 py-1 h-fit hover:bg-gray-200
                    border-l hover:border-gray-400 border-transparent
                "
                onclick={() => (open = !open)}
            >
                {@render head()}
            </button>
        {:else}
            <span
                class="px-2 py-1 w-full h-fit hover:bg-gray-200
                    border-l hover:border-gray-400 border-transparent
                "
            >
                {@render head()}
            </span>
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
        {#if innerSchema}
            <Schema open root={false}
                schemaName={null}
                schema={innerSchema.resolution.obj}
                resolutionDepth={innerSchema.newDepth}
                parentName="{fullName}[i]"
            >
                {#snippet beforeName()}
                    {#if settings.display.showItemsLineOnArray}
                        <span class="-mr-1 text-gray-600 text-sm font-mono">Items:</span>
                    {/if}
                {/snippet}
            </Schema>
        {/if}
        <!--// Not based on type because of degenerate values like
            // type: 'string'
            // properties: {...}
            // items: {...} -->
        {#each Object.entries(resolvedSchema.obj.properties ?? {}) as [key, prop] (key)}
            <Schema open root={false}
                parentName={fullName}
                schemaName={key}
                schema={prop}
                resolutionDepth={newDepth}
            >
                {#snippet beforeName()}
                    <span class="inline-block -mr-2">.</span>
                {/snippet}
            </Schema>
        {/each}
    </div>
</div>
