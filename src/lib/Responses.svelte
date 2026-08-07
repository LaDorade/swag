<script lang="ts">
    import Response from "./Response.svelte";

    interface Props {
        responses: Record<string, {
            content: object;
            description: string;
            summary?: string;
        }>
    }

    let {
        responses: opResponses
    }: Props = $props()

    let responses = $derived(Object.entries(opResponses ?? {}))
</script>

<div class="flex flex-col gap-2">
    {#each responses as [code, response], i (code)}
        <Response open={i === 0} response={{
            ...response,
            code
        }} />
    {/each}
</div>
