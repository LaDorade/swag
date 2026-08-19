<script lang="ts">
    import Editor from "./Codemirror/Editor.svelte";
    import { specStore } from "./stores/Spec.svelte";
    import type { ExampleObject, ReferenceObject } from "../types/oas";

    interface Props {
        name?: string;
        example: ExampleObject | ReferenceObject | null;
    }

    let {
        name,
        example,
    }: Props = $props();

    let exampleResolution = $derived(example ? specStore.evaluate<ExampleObject >(example) : null)
</script>

{#if exampleResolution?.ok}
    {@const example = exampleResolution.obj}
    <Editor content={JSON.stringify(example.value ?? '', null, 2)} />
{:else}
    <span class="text-red-500">No value for example "{name}"</span>
{/if}
