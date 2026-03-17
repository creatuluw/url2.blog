<script lang="ts">
    import { Carta, MarkdownEditor as CartaEditor } from "carta-md";
    import DOMPurify from "isomorphic-dompurify";

    let {
        value = $bindable(""),
        placeholder = "Start writing...",
    }: { value?: string; placeholder?: string } = $props();

    const carta = new Carta({
        sanitizer: DOMPurify.sanitize,
    });
</script>

<CartaEditor {carta} bind:value {placeholder} mode="tabs" theme="github" />

<style>
    /* GitHub Theme for Carta Markdown Editor */
    :global(.carta-theme__github) {
        --background: #0d1117;
        --background-light: #161b22;
        --border: #2b3138;
        --accent: #1f6feb;
    }

    /* Core Editor Styles */
    :global(.carta-theme__github.carta-editor) {
        background-color: #ffffff;
        border: none;
        border-radius: 0;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    :global(.carta-theme__github.carta-editor:focus-within) {
        outline: none;
    }

    :global(.carta-theme__github.carta-editor .carta-wrapper) {
        padding: 1rem;
        flex-grow: 1;
        height: 100%;
        overflow: hidden;
    }

    :global(.carta-theme__github.carta-editor .carta-container) {
        height: 100%;
    }

    :global(.carta-theme__github.carta-editor .carta-input-wrapper) {
        height: 100%;
        overflow: auto;
    }

    :global(.carta-theme__github.carta-editor .carta-input),
    :global(.carta-theme__github.carta-editor .carta-renderer) {
        height: 100%;
        overflow: auto;
    }

    :global(.carta-theme__github.carta-editor .carta-font-code) {
        font-family: var(--font-fira-code);
        caret-color: #24292f;
        font-size: 0.8rem;
    }

    /* Toolbar Styles */
    :global(.carta-theme__github.carta-editor .carta-toolbar) {
        height: 2.5rem;
        background-color: #f6f8fa;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
    }

    :global(.carta-theme__github.carta-editor .carta-toolbar .carta-icon) {
        width: 2rem;
        height: 2rem;
    }

    :global(
        .carta-theme__github.carta-editor .carta-toolbar .carta-icon:hover
    ) {
        color: #24292f;
        background-color: #f3f4f6;
    }

    :global(.carta-theme__github.carta-editor .carta-toolbar-left button),
    :global(.carta-theme__github.carta-editor .carta-toolbar-right),
    :global(.carta-theme__github.carta-editor .carta-filler) {
        border-bottom: none;
    }

    :global(
        .carta-theme__github.carta-editor .carta-toolbar-left > *:first-child
    ) {
        border-top-left-radius: 0;
    }

    :global(.carta-theme__github.carta-editor .carta-toolbar-left > *) {
        padding-left: 1rem;
        padding-right: 1rem;
        font-size: 0.95rem;
    }

    :global(.carta-theme__github.carta-editor .carta-toolbar-left button) {
        height: 100%;
    }

    :global(
        .carta-theme__github.carta-editor .carta-toolbar-left .carta-active
    ) {
        background-color: #ffffff;
        color: #24292f;
        border-right: 1px solid #d0d7de;
        border-bottom: 1px solid #ffffff;
    }

    :global(
        .carta-theme__github.carta-editor
            .carta-toolbar-left
            .carta-active:not(:first-child)
    ) {
        border-left: 1px solid #d0d7de;
    }

    :global(.carta-theme__github.carta-editor .carta-toolbar-right) {
        padding-right: 12px;
    }

    /* Icons Menu */
    :global(.carta-theme__github.carta-editor .carta-icons-menu) {
        padding: 8px;
        border: 1px solid #d0d7de;
        border-radius: 6px;
        min-width: 180px;
        background: #ffffff;
    }

    :global(
        .carta-theme__github.carta-editor .carta-icons-menu .carta-icon-full
    ) {
        padding-left: 6px;
        padding-right: 6px;
        margin-top: 2px;
    }

    :global(
        .carta-theme__github.carta-editor
            .carta-icons-menu
            .carta-icon-full:first-child
    ) {
        margin-top: 0;
    }

    :global(
        .carta-theme__github.carta-editor
            .carta-icons-menu
            .carta-icon-full:hover
    ) {
        color: white;
        background-color: #2b3138;
    }

    :global(
        .carta-theme__github.carta-editor
            .carta-icons-menu
            .carta-icon-full
            span
    ) {
        margin-left: 6px;
        color: white;
        font-size: 0.85rem;
    }

    /* Emoji Plugin */
    :global(.carta-theme__github.carta-emoji) {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        width: 19rem;
        max-height: 14rem;
        overflow-x: auto;
        overflow-y: auto;
        border-radius: 4px;
        font-family: inherit;
        background-color: #ffffff;
        word-break: break-word;
        scroll-padding: 6px;
    }

    :global(.carta-theme__github.carta-emoji button) {
        background: #f6f8fa;
        cursor: pointer;
        display: inline-block;
        border-radius: 4px;
        border: 0;
        padding: 0;
        margin: 0.175rem;
        min-width: 2rem;
        height: 2rem;
        font-size: 1.2rem;
        line-height: 100%;
        text-align: center;
        white-space: nowrap;
    }

    :global(.carta-theme__github.carta-emoji button:hover),
    :global(.carta-theme__github.carta-emoji button.carta-active) {
        background: #f3f4f6;
    }

    /* Slash Plugin */
    :global(.carta-theme__github.carta-slash) {
        width: 18rem;
        max-height: 14rem;
        overflow-y: scroll;
        border-radius: 4px;
        font-family: inherit;
        background-color: #ffffff;
        padding: 6px;
        scroll-padding: 6px;
    }

    :global(.carta-theme__github.carta-slash span) {
        width: fit-content;
    }

    :global(.carta-theme__github.carta-slash button) {
        background: none;
        width: 100%;
        padding: 10px;
        border: 0;
        border-radius: 4px;
    }

    :global(.carta-theme__github.carta-slash .carta-slash-group) {
        padding: 0 4px 0 4px;
        margin-bottom: 4px;
        font-size: 0.8rem;
    }

    :global(.carta-theme__github.carta-slash button.carta-active),
    :global(.carta-theme__github.carta-slash button:hover) {
        background: #f6f8fa;
        cursor: pointer;
    }

    :global(.carta-theme__github.carta-slash .carta-snippet-title) {
        font-size: 0.85rem;
        font-weight: 600;
    }

    :global(.carta-theme__github.carta-slash .carta-snippet-description) {
        font-size: 0.8rem;
        text-overflow: ellipsis;
    }

    /* Shiki Syntax Highlighting for Dark Mode */
    :global(html.dark .carta-theme__github .shiki),
    :global(html.dark .carta-theme__github .shiki span) {
        color: var(--shiki-dark) !important;
    }

    /* Markdown Renderer Styles */
    :global(.carta-renderer) {
        font-family: var(--font-inter);
        font-size: 0.875rem;
        line-height: 1.6;
        padding: 1rem;
    }

    :global(.carta-renderer h1) {
        font-family: var(--font-aspekta);
        font-size: 1.5rem;
        font-weight: 650;
        margin: 1rem 0 0.5rem;
    }

    :global(.carta-renderer h2) {
        font-family: var(--font-aspekta);
        font-size: 1.25rem;
        font-weight: 650;
        margin: 1rem 0 0.5rem;
    }

    :global(.carta-renderer h3) {
        font-family: var(--font-aspekta);
        font-size: 1rem;
        font-weight: 650;
        margin: 0.75rem 0 0.5rem;
    }

    :global(.carta-renderer p) {
        margin: 0.5rem 0;
    }

    :global(.carta-renderer code) {
        font-family: var(--font-fira-code);
        background: #f6f8fa;
        padding: 0.2em 0.4em;
        border-radius: 6px;
        font-size: 85%;
    }

    :global(.carta-renderer pre) {
        font-family: var(--font-fira-code);
        background: #f6f8fa;
        padding: 1rem;
        border-radius: 6px;
        overflow-x: auto;
        margin: 0.5rem 0;
    }

    :global(.carta-renderer pre code) {
        background: transparent;
        padding: 0;
    }

    :global(.carta-renderer blockquote) {
        border-left: 4px solid #dfe2e5;
        padding-left: 1rem;
        color: #6a737d;
        margin: 0.5rem 0;
    }

    :global(.carta-renderer ul, .carta-renderer ol) {
        padding-left: 2rem;
        margin: 0.5rem 0;
    }

    :global(.carta-renderer li) {
        margin: 0.25rem 0;
    }

    :global(.carta-renderer a) {
        color: #0366d6;
        text-decoration: none;
    }

    :global(.carta-renderer a:hover) {
        text-decoration: underline;
    }
</style>
