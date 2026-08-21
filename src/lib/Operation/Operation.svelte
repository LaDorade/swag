<script lang="ts">
    import { getOperationAnchor, methodToColor } from "#lib";
    import Parameters from "../Parameters.svelte";
    import RequestBody from "../RequestBody.svelte";
    import Responses from "../Responses.svelte";
    import { OperationContext } from "./OperationContext.svelte";

    import type { OperationT } from "#types";

    interface Props {
        operation: OperationT;
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
        // tags,
        requestBody,
        parameters = [],
    } = $derived(operation.operationData)
    let responses = $derived(operation.operationData.responses ?? {})

    let anchor = $derived(getOperationAnchor(method, path))
    let methodColor = $derived(methodToColor(method))

    let tabs = $derived.by(() => {
        const t = [];
        if (parameters?.length)
            t.push({ label: 'Parameters' } as const)
        if (requestBody)
            t.push({ label: 'Request Body' } as const)
        if (responses)
            t.push({ label: 'Responses' } as const)
        return t;
    })
    let activeTab = $derived(tabs[0]?.label ?? '')

    let operationContext = OperationContext.create(() => operation);

    /**
     * @IO
     */
    function toggleOpen() {
        open = !open;
        operationContext.tryItOut = false;
    }
    /**
     * @IO
     */
    async function execute() {
        // TODO: validation de tous les objets pour la requête
        const r = await operationContext.executeRequest();
        // TODO: agir en fonction de la réponse
        activeTab = 'Responses';
    }
</script>

<div
    id={anchor}
    class="text-sm w-full flex flex-col overflow-none bg-gray-50 border rounded
    target:animate-hightlight
    {operationContext.tryItOut ? 'border-gray-200 shadow-lg' : 'border-gray-200' }
    "
>
    <button class="h-full w-full p-2 flex items-center gap-2 font-mono
        cursor-pointer {methodColor} border-gray-200 hover:brightness-90"
        title={summary ?? path}
        class:border-b={open}
        onclick={toggleOpen}>
        <span class="text-base uppercase w-20">{method}</span>
        <span class="border-l border-gray-300 h-6"></span>
        <div class="pl-2 py-0.5 text-left text-nowrap w-full flex items-baseline gap-2 bg-geray-50 rounded overflow-hidden">
            <span class="font-bold">{path}</span>
            <i class="px-0.5 text-xs text-gray-600 italic truncate w-full">{summary}</i>
            <span class="text-gray-600 ml-auto pr-2">{open ? '▲' : '▼'}</span>
        </div>
    </button>

    {#if open}
        <div class="flex flex-col">
            {#if description}
                <div class="p-2 leading-6 flex text-center border-b border-gray-200">
                    <span class="italic text-gray-600">
                        {description}
                    </span>
                </div>
            {/if}
            <div class="flex items-baseline text-center border-b border-gray-200">
                {#each tabs as tab (tab.label)}
                    {@const { label } = tab}
                    {@const active = activeTab === label}
                    <button onclick={() => activeTab = label}
                        class="leading-6 p-2 flex flex-col gap-2
                        {active ? 'bg-gray-100' : ''} cursor-pointer hover:bg-gray-100">
                        {label}
                    </button>
                {/each}
                <div class="flex items-baseline gap-2 px-1 ml-auto text-sm">
                    <!-- TODO: setup tag handing -->
                    <!-- {#if tags?.length}
                        <div class="flex items-baseline gap-2 px-2">
                            {#each tags as tag (tag)}
                                <span class="flex items-baseline bg-gray-100 px-2 py-1
                                    {stringToTailwindColor(tag)}
                                    rounded-xl border border-gray-200">
                                    {tag}
                                </span>
                            {/each}
                        </div>
                    {/if} -->
                    {#if operationContext.tryItOut}
                        <button class="
                            w-fit px-2 py-1 border-blue-200 bg-blue-50 border rounded
                            cursor-pointer hover:bg-blue-100
                        "
                        onclick={execute}
                        >
                            Execute
                        </button>
                    {/if}
                    <button
                        onclick={() => (operationContext.tryItOut = !operationContext.tryItOut)}
                        class="border rounded bg-white px-2 py-1
                            cursor-pointer
                            {operationContext.tryItOut
                                ? 'border-red-400 hover:bg-red-50 rounded-tl-none'
                                : 'border-green-400 hover:bg-green-50 rounded-bl-none'}
                        ">
                        {operationContext.tryItOut ? 'Cancel' : 'Try it Out'}
                    </button>
                </div>
            </div>
            <div class="activeTab p-2">
                {#if parameters?.length}
                    <div class:hidden={activeTab !== 'Parameters'}>
                        <Parameters {parameters} />
                    </div>
                {/if}
                {#if requestBody}
                    <div class:hidden={activeTab !== 'Request Body'}>
                        <RequestBody {requestBody} />
                    </div>
                {/if}
                {#if responses}
                    <div class:hidden={activeTab !== 'Responses'}>
                        <Responses {responses} />
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>
