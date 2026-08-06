<script lang="ts">
    import Schema from "./Schema.svelte"
    import { specStore } from "#lib/stores/Spec.svelte.js";
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

    let resolved = $derived(specStore.resolveSchema(s, resolutionDepth))
    const newDepth = $derived(resolved.type === 'inline'
        ? resolutionDepth
        : resolutionDepth - 1)

    let properties = $derived(Object.entries(resolved.schema.properties ?? {}))

    let type = $derived(deduceSchemaType(resolved.schema))
    let subSchema = $derived(
        resolved.schema.items
        ? specStore.resolveSchema(resolved.schema.items, resolutionDepth)
        : null
    )

    // Foldable only if inner properties
    let foldable = $derived(
           subSchema?.resolved
        || resolved.schema.properties)

    // Dont render head (infos) objects with no name (likely only referenced in array)
    let renderHead = $derived(
        !(resolved.schema.properties && !name)
    )

    if (name === 'address') {
        console.log(resolved)
    }

</script>

{#snippet ref(r: string)}
    <a onclick={e => e.stopPropagation()} href="#{getSchemaAnchor(r)}"
        class="hover:underline">{r}</a>
{/snippet}

{#snippet head()}
    <div class="w-full h-full px-1 py-0.5">
        {#if name}
            <span class="font-mono">{name}</span>
            {#if resolved.type === 'resolved' && resolved.origin.$ref}
                <span class="text-xs italic text-gray-500">-&rsaquo; {@render ref(resolved.origin.$ref)}</span>
            {/if}
        {/if}
        {#if resolved.resolved}
            {#if type}
                <span class="text-sm italic font-mono text-blue-700">
                    {#if type === 'array' && subSchema}
                        {#if subSchema.schema.type}
                            {type}({subSchema.schema.type})
                        {:else if subSchema.schema.$ref}
                            {type}{@render ref(subSchema.schema.$ref)}
                        {:else}
                            {type}
                        {/if}
                    {:else}
                        {type}
                    {/if}
                </span>
            {/if}
            {#if resolved.schema.format}
                <span class="text-xs font-mono text-gray-700">({resolved.schema.format})</span>
            {/if}
        {:else if resolved.type === 'maxDepth'}
            <span class="text-xs italic text-gray-500">
                -&rsaquo; {@render ref(resolved.origin.$ref)} (max depth)</span>
        {:else if resolved.type === 'unresolved'}
            <span class="text-xs italic text-red-800">
                -&rsaquo; {resolved.schema.$ref} (unresolved)</span>
        {/if}
        {#if parentName}
            <span class="pl-1 text-xs text-gray-400">{fullName}</span>
        {/if}
        {#if foldable}
            <span class="text-gray-800">
                {open ? '▲' : '▼'}</span>
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
        {#if subSchema?.schema}
            <Schema open
                schema={subSchema.schema}
                resolutionDepth={newDepth}
                parentName="{fullName}[i]"
                />
        {/if}
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
