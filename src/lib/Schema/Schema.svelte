<script lang="ts">
    import { resolveRef } from "#lib";
    import { specStore } from "#lib/stores/Spec.svelte.ts";
    import Schema from "./Schema.svelte"
    interface Props {
        open?: boolean;
        name?: string;
        schema: {
            description?: string;
            type?: string;
            format?: string;
            default?: string;

            const?: string;
            enum?: string[];

            required?: string[];
            properties?: Record<string, Props['schema']>;
            additionalProperties?: Record<string, unknown>;

            items: Props['schema'];

            minimum?: number;
            maximum?: number;

            examples?: Record<string, unknown>

            $ref?: string;


            // TODO:
            // https://spec.openapis.org/oas/v3.2.0.html#generic-data-structure-model
            // $id, $defs, $dynamicDefs, $dynamicAnchor
            // discriminator
            // allOf
            // anyOf
            // oneOf
        },
    }

    let {
        name,
        schema,
        open = $bindable(false),
    }: Props = $props()

    $effect(() => {
    })

    let properties = $derived(Object.entries(schema.properties ?? {}))

    let showButton = $derived(schema.items || schema.properties || schema.$ref)

    let type = $derived(deduceType(schema))
    let subType = $derived(deduceSubType(schema))
    let fullType = $derived(getFullType())


    function deduceType(s: Props['schema']): string {
        // same proiority as Swagger
        if (s.type) return s.type;
        if (s.items) return 'array'
        if (s.properties) return 'object'
        return ''
    }

    function deduceSubType(s: Props['schema']): string | null {
        if (s.items) return s.items.type ?? s.items.$ref ?? null
        return null
    }

    function getFullType(): string {
        if (type === 'array' && subType)
            return `array<${subType}>`
        return type;
    }
</script>

<div class="w-full font-mono">
    {#if name}
        <span class="font-mono">{name}</span>
    {/if}
    {#if type}
        <span class="text-sm italic font-mono text-blue-700">{fullType}</span>
    {/if}
    {#if schema.format}
        <span class="text-xs font-mono text-gray-700">({schema.format})</span>
    {/if}
    {#if schema.$ref}
        <span class="text-sm font-bold italic text-blue-900">{schema.$ref}</span>
    {/if}

    {#if showButton}
        <button
            class="font-sans px-1 py-0.5 text-xs border"
            onclick={() => (open = !open)}
        >
            {open ? "fold" :"unfold"}
        </button>
    {/if}

    {#if open}
        {#if schema.$ref}
            {@const refObj = resolveRef(specStore.spec, schema.$ref)}
            <div class="pl-2 flex flex-col gap-0">
                <Schema
                    open schema={refObj}
                />
            </div>
        {/if}
        {#if schema.items}
            <div class="pl-2 flex flex-col gap-0">
                <Schema
                    schema={schema.items}
                />
            </div>
        {/if}
        {#if properties.length}
            <div class="pl-2 flex flex-col gap-0">
                {#each properties as [key, prop] (key)}
                    <Schema
                        name={key} schema={prop}
                    />
                {/each}
            </div>
        {/if}
    {/if}
</div>
