<script lang="ts">
    import WithExample from "./Example/WithExample.svelte";
    import type { ParameterObject } from "#types/oas.js";
    import { getOperationContext } from "./Operation/OperationContext.svelte";

    interface Props {
        param: ParameterObject;
    }
    let {
        param
    }: Props = $props();

    const operationContext = getOperationContext()
    let {schema, examples, name} = $derived(param);

    let example: WithExample | null = $state(null);
    operationContext.registerParameter(() => param, () => {
        return example?.getEditorContent() ?? null;
    });
</script>

<div class="parameter flex flex-col leading-6">
    {#if name}
        <h3 class="text-sm w-fit flex items-baseline gap-2">
            <span>Name: </span>
            <span class="font-mono font-bold ">{name}</span></h3>
    {/if}
    <WithExample
        bind:this={example}
        {schema} {examples}
        readOnly={!operationContext.tryItOut}
    />
</div>
