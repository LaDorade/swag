<script lang="ts">
    import { getOperationAnchor } from "#lib";
    import Parameters from "./Parameters.svelte";
    import RequestBody from "./RequestBody.svelte";
    import Responses from "./Responses.svelte";

    interface OperationData {
        tags?: string[];
        summary?: string;
        requestBody?: unknown;
        parameters?: unknown[];
        responses?: object;
        description?: string;
    };

    interface Operation {
        path: string,
        method: string,
        operationData: OperationData
    }

    interface Props {
        operation: Operation;
        open?: boolean;
    }

    let {
        operation,
        open = $bindable(false)
    }: Props = $props()

    let {
        method,
        path,
    } = $derived(operation)
    let {
        summary,
        description,
        tags,
        requestBody,
        parameters = [],
    } = $derived(operation.operationData)

    let responses = $derived(operation.operationData?.responses ?? {})

    let anchor = $derived(getOperationAnchor(method, path))
</script>

<details
    id={anchor}
    bind:open
    class="w-full p-2 flex flex-col open:gap-2 bg-gray-50 border border-gray-300 rounded"
>
    <summary class="font-mono">
        <span
            class="h-fit px-2 py-1 rounded-sm bg-blue-100"
        >[{method}]</span>
        <span>{path}</span>
        <span class="text-sm text-gray-600 italic">{summary}</span>
    </summary>
    <div class="flex flex-col gap-2">
        {#if description}
            {description}
            {/if}
        {#if parameters?.length}
            <Parameters parameters={parameters as any} />
            {/if}
        {#if requestBody}
            <RequestBody {requestBody} />
            {/if}
        {#if responses}
            <Responses responses={responses as any} />
        {/if}
    </div>
</details>
