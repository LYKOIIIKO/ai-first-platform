# PR presentation

Choose the smallest GitHub Markdown format that explains the change. A short PR may need only a paragraph and links.

| What to show | Format |
| --- | --- |
| Changed behavior | A concrete before-and-after example or a short `diff` block |
| Sequence or interaction | A Mermaid flowchart, sequence diagram, or call tree |
| Algorithm | Pseudocode for the decisions that changed |
| Responsibilities | A shallow file or component tree |
| Related outcomes | A compact table |
| Required owner actions | An ordered list, with task boxes when tracking completion |
| Visible behavior | A screenshot, a before-and-after pair, or a recording |
| Exact commands and output | A fenced code block within a disclosure |
| A limitation that affects acceptance | A visible paragraph or a GitHub alert |

## Diagrams and images

Start a diagram at the actual trigger. Name actors by role and show what passes between them. Include boundaries that change the behavior, including permission checks. Label the diagram as a model or process. Use the team language for labels.

Give images meaningful alt text and a caption with the scenario and observed result. Use accessible evidence links. Describe what a recording demonstrates. A screenshot can establish that a button disappeared. A separate check is needed to establish API authorization.

## Disclosures and links

Leave blank lines before and after Markdown inside `<details>` so GitHub can render tables and code blocks. Use a descriptive `<summary>` and one level of disclosure. Use descriptive links and commit permalinks for revision-specific evidence. Let GitHub checks show live CI status. When describing a CI result in the body, link to the named run and revision.

## Rendering

Use the GitHub preview or rendered PR when available. Inspect diagrams, tables, disclosures, links, and captions. If the preview is unavailable, disclose that limit and use simple Markdown for any format you cannot verify.

GitHub references are [basic formatting](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax), [collapsed sections](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/organizing-information-with-collapsed-sections), and [diagrams](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams).
