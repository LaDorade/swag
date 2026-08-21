<script lang="ts">
    import Schema from "../Schema/Schema.svelte";
    import Editor from "../Codemirror/Editor.svelte";
    import { settings } from "../stores/Settings.svelte";
    import { specStore } from "../stores/Spec.svelte";
    import { schemaToExample } from "../Schema/schemaExample";

    import type { UnresolvedSchema } from "#types";
    import type { ExampleObject, ReferenceObject } from "#types/oas.js";

    interface Props {
        // FIXME: on fait quoi si on a rien du tout ?
        examples?: Record<string, ExampleObject | ReferenceObject>;
        // FIXME: determiner ce qu'on fait/si cela a du sens, quand on a pas de schéma
        schema?: UnresolvedSchema;
        class?: string;
        readOnly?: boolean;
    }
    let {
        examples,
        schema,
        class: className = '',
        readOnly = true,
    }: Props = $props();

    // Tabs
    let tabs = [
        {
            label: 'Example value',
            value: 'examples',
        },
        {
            label: 'Schema',
            value: 'schema',
        }
    ] as const;
    let activeTab: 'examples' | 'schema' = $state('examples');

    // Examples
    let examplesName = $state(() => Object.keys(examples ?? {}).concat(['__auto__']));
    let activeExampleName: string = $derived(examplesName()[0])
    let activeExample = $derived(examples?.[activeExampleName]);
    let exampleResolution = $derived(activeExample ? specStore.evaluate<ExampleObject>(activeExample) : null)

    // Schema
    let resolvedSchema = $derived(schema
        ? specStore.evaluateSchemaFull(schema, settings.resolution.schemaMaxResolutionDepth)
        : null)
    let schemaExample = $derived(resolvedSchema?.ok ? schemaToExample(resolvedSchema.obj) : null);

    // Codemirror
    let editor: Editor | null = $state(null);
    let exampleContent = $derived.by(() => {
        if (exampleResolution?.ok) {
            return exampleResolution.obj.value ?? ''
        }
        if (schemaExample) {
            return schemaExample;
        }

        // invalid
        return null;
    })

    export function getEditorContent(): string | null {
        return editor?.getContent() ?? null;
    }
</script>

<div class="flex flex-col gap-4 bg-gray-50 rounded {className}">
    <nav class="flex leading-6 ">
        {#each tabs as tab (tab.value)}
            <button
                onclick={() => (activeTab = tab.value)}
                class:underline={activeTab === tab.value}
                class="text-sm leading-6 text-gray-700 border-gray-400 first:border-r first:pl-0 px-2 cursor-pointer">
                {tab.label}</button>
        {/each}

        <div class="ml-auto text-sm flex items-baseline gap-2">
            {#if activeTab === 'examples'}
                <span class="text-gray-600">
                    Example:
                </span>
                <select
                    class="px-2 italic border border-gray-300 rounded"
                    bind:value={activeExampleName}>
                    {#each examplesName() as example (example)}
                        <option class="w-fit"
                            value={example}>{example.toString()}</option>
                    {/each}
                </select>
            {/if}
        </div>
    </nav>
    <div class="border border-gray-200 rounded bg-white">
        {#if exampleContent && activeTab === 'examples' && (examples || schema)}
            <Editor
                bind:this={editor}
                {readOnly}
                lang='json'
                content={JSON.stringify(exampleContent, null, 2)}
            />
        {:else if activeTab === 'schema' && schema}
            <Schema open
                {schema}
                resolutionDepth={settings.resolution.schemaMaxResolutionDepth}
            />
        {:else}
            {console.warn(examples, schema, 'Missing schema or examples')}
            <span class="flex items-baseline gap-2 px-2 text-sm leading-8 font-mono">
                <span>Missing examples and/or schema or unresolved schema</span>
            </span>
        {/if}
    </div>
</div>
