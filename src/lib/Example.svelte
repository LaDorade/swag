<script lang="ts">
    import Editor from "./Codemirror/Editor.svelte";
    import { specStore } from "./stores/Spec.svelte";
    import type { ExampleObject, ReferenceObject } from "../types/oas";

    interface Props {
        name?: string;
        example: ExampleObject | ReferenceObject;
    }

    let {
        name,
        example,
    }: Props = $props();

    let exampleResolution = $derived(specStore.evaluate<ExampleObject>(example))
    let value = $derived(exampleResolution.ok ? exampleResolution.obj.value : null)
</script>

{#if value}
    <Editor content={JSON.stringify(value ?? '', null, 2)} />
{:else}
    <span class="text-red-500">No value for example "{name}"</span>
{/if}
