<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { basicSetup, EditorView } from "codemirror";
    import { json } from "@codemirror/lang-json";
    import { yaml } from "@codemirror/lang-yaml";
    import { xml } from "@codemirror/lang-xml";
    import { vim } from "@replit/codemirror-vim";
    import { Compartment, EditorState } from "@codemirror/state";
    import { getOperationContext } from "#lib/Operation/OperationContext.svelte.js";

    interface Props {
        content: string;
        lang?: 'json' | 'yaml' | 'xml' | 'text'
    }

    let {
        content,
        lang = 'json'
    }: Props = $props();

    let operationContext = getOperationContext();

    let editorDiv: HTMLDivElement | null = $state(null);
    let view: EditorView | null = $state(null);
    const readOnly = new Compartment()

    $effect(() => {
        if (!editorDiv || !view) return;
        view.dispatch({
            effects: readOnly.reconfigure([
                EditorState.readOnly.of(!operationContext.tryItOut),
                EditorView.editable.of(operationContext.tryItOut)
            ])
        })
    })

    onMount(() => {
        if (!editorDiv) return;

        const extensions = [
            basicSetup,
            readOnly.of([
                EditorState.readOnly.of(!operationContext.tryItOut),
                EditorView.editable.of(operationContext.tryItOut)
            ]),
            vim(),
            EditorView.theme({
                "&": {
                    backgroundColor: "var(--color-white)"
                },
                "&.cm-editor.cm-focused": {
                    outline: "none"
                }
            }),
        ];
        switch (lang) {
            case 'json': extensions.push(json()); break;
            case 'yaml': extensions.push(yaml()); break;
            case 'xml': extensions.push(xml()); break;
            case 'text': break;
        }

        view = new EditorView({
            doc: content,
            parent: editorDiv,
            extensions
        });
    })

    onDestroy(() => {
        if (view) {
            view.destroy();
            view = null;
        }
    })
</script>

<div bind:this={editorDiv} class="
    text-base rounded border
    {operationContext.tryItOut ? 'border-green-200' : 'border-transparent'}
">
</div>
