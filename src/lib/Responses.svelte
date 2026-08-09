<script lang="ts">
    import ResponseComp from "./Response.svelte";
    import type { ResponsesObject } from "#types/oas.js";

    interface Props {
        responses: ResponsesObject
    }

    let {
        responses
    }: Props = $props()

</script>

<div class="flex flex-col gap-2">
    {#each Object.entries(responses) as [code, response], i (code)}
        <ResponseComp open={i === 0} response={{
            ...response,
            code
        }} />
    {/each}
</div>
