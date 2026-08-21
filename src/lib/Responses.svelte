<script lang="ts">
    import Response from "./Response.svelte";
    import { getOperationContext } from "./Operation/OperationContext.svelte";
    import type { ResponsesObject } from "#types/oas.js";

    interface Props {
        responses: ResponsesObject
    }

    let {
        responses
    }: Props = $props()

    const operationContext = getOperationContext();

    let resps = $state(() => Object.entries(responses))
</script>

<div class="flex flex-col gap-2">
    {#each resps() as [code, response], i (code)}
        <Response
            open={i === 0} response={{
            ...response,
            code
        }} />
    {/each}
</div>
