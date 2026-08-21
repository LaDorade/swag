<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { basicSetup, EditorView } from "codemirror";
    import { Compartment, EditorState } from "@codemirror/state";
    import { json } from "@codemirror/lang-json";
    import { yaml } from "@codemirror/lang-yaml";
    import { xml } from "@codemirror/lang-xml";
    import { vim } from "@replit/codemirror-vim";

    interface Props {
        content: string;
        lang?: 'json' | 'yaml' | 'xml' | 'text',
        readOnly?: boolean
    }

    let {
        content,
        lang = 'json',
        readOnly = true
    }: Props = $props();

    let editorDiv: HTMLDivElement | null = $state(null);
    let view: EditorView | null = $state(null);
    const readOnlyEditor = new Compartment()

    // add/remove readonly when change occur
    $effect(() => {
        if (!editorDiv || !view) return;
        view.dispatch({
            effects: readOnlyEditor.reconfigure([
                EditorState.readOnly.of(readOnly),
                EditorView.editable.of(!readOnly)
            ])
        })
    })

    // update content of CM if text changes from outside
    $effect(() => {
        if (!view) return;
        view.dispatch({
            changes: [{
                from: 0, to: view.state.doc.length, insert: content
            }]
        })
    })

    onMount(() => {
        if (!editorDiv) return;

        const extensions = [
            basicSetup,
            readOnlyEditor.of([
                EditorState.readOnly.of(readOnly),
                EditorView.editable.of(readOnly)
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

    export function getContent(): string | null {
        return view?.state.doc.toString() ?? null;
    }
</script>

<div bind:this={editorDiv} class="
    text-base rounded border
    {readOnly ? 'border-transparent' : 'border-green-200'}
">
</div>
