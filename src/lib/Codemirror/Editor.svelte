<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { basicSetup, EditorView, minimalSetup } from "codemirror";
    import { json } from "@codemirror/lang-json";
    import { yaml } from "@codemirror/lang-yaml";
    import { xml } from "@codemirror/lang-xml";
    import { vim } from "@replit/codemirror-vim";

    interface Props {
        content: string;
        lang?: 'json' | 'yaml' | 'xml' | 'text'
    }

    let {
        content,
        lang = 'json'
    }: Props = $props();

    let editorDiv: HTMLDivElement | null = $state(null);
    let view: EditorView | null = $state(null);
    onMount(() => {
        if (!editorDiv) return;

        const extensions = [
            vim(),
            basicSetup,
            minimalSetup,
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

<div bind:this={editorDiv} class="text-base rounded border border-transparent">
</div>
