<!--
Conversion du JSON Schema en version json/xml/... pour codemirror
Pourrais potentillement être mis directement dans le composant <Schema
avec une option
-->
<script lang="ts">
    import { specStore } from "#lib/stores/Spec.svelte.js";
    import { schemaToExample } from "./schemaExample";

    import type { UnresolvedSchema } from "#types";
    import Editor from "#lib/Codemirror/Editor.svelte";
    import Ref from "./Ref.svelte";

    interface Props {
        schema?: UnresolvedSchema;
        resolutionDepth?: number;
        lang?: 'json' | 'yaml' | 'xml' | 'text',
        readOnly?: boolean;
    }

    let {
        schema,
        resolutionDepth = 0,
        lang = 'json',
        readOnly = true,
    }: Props = $props();

    let resolvedSchema = $derived(schema ? specStore.evaluateSchemaFull(schema, resolutionDepth) : null)
    let example = $derived(resolvedSchema?.ok ? schemaToExample(resolvedSchema.obj) : null);
</script>

{#if resolvedSchema}
    {#if resolvedSchema?.ok}
        <Editor
            {readOnly}
            {lang}
            content={JSON.stringify(example, null, 2)}
        />
    {:else}
        <span class="flex items-baseline gap-2 px-2 text-sm leading-8 font-mono">
            <span>Unable to evaluate example schema</span>
            <Ref ref={resolvedSchema.obj.$ref} status={resolvedSchema.status} />
        </span>
    {/if}
{/if}
