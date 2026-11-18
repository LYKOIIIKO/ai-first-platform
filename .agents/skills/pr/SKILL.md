---
name: pr
description: "Use when writing or updating a PR body."
metadata:
  credits:
    skill: show-me
    author: Dex Horthy
    organisation: Humanlayer
    url: "https://github.com/humanlayer/skills/blob/main/plugins/show-me/skills/show-me/SKILL.md"
---

Write a PR description the owner can understand from the PR itself. Follow the project's `AGENTS.md` for audience and writing style. Write PR headings in Russian. Use the project's domain terms from `DOMAIN.md`. This skill covers the PR description. Follow the user's request for any publication or delivery actions.

## Draft the description

1. Read the actual diff, the linked issue or spec, the recorded checks, and any available review findings. Follow the tracker and writing guidance linked from `AGENTS.md` where it applies.
2. Lead with the problem, the resulting behavior, and the affected scope. Use a concrete example when it helps. For diagrams, visual evidence, or formatting beyond the template, read the relevant section of [PRESENTATION.md](PRESENTATION.md).
3. Summarize what the evidence confirms and state material limits in the visible text. Put exact commands, detailed results, and checked revisions in a disclosure when the detail would interrupt reading.
4. State any decision or manual check the owner needs to make. Include the action, expected result, and reason. If no further check is needed and the section would help the owner, briefly explain why.
5. State the consequences and how to roll back. Identify any irreversible effects, material uncertainty, or deviations from requirements. Inspect the rendered result where available.

## Suggested structure

Adapt the template to the size of the change. Omit empty sections and replace all placeholders. Include agent attribution if the project requires it.

````markdown
## Что изменилось

<проблема, новое поведение и затронутые сценарии>

## Проверки

<фактический результат и важные ограничения>

<details>
<summary>Подробности проверок</summary>

Проверенная версия — <постоянная ссылка на коммит или локальные изменения, если коммита ещё нет>.
База сравнения — <SHA, если использовали базовый коммит>.

| Проверка | Результат | Что подтверждает |
| --- | --- | --- |
| <команда или ручное действие> | <фактический результат> | <что проверено и какие есть ограничения> |

</details>

## Что нужно сделать владельцу

<действие или решение, ожидаемый результат и причина>

## Риски и откат

<последствия, возможность отката и порядок действий>
````

## Evidence and owner actions

- List the checks performed against the result being described, including manual observations. Identify the checked revision or working tree. Distinguish current evidence from earlier runs, skipped or unavailable checks, and proposed checks. Tie claims to the issue or spec and the behavior each check exercised.
- For a bug fix, show an observed before-and-after result when available. If a test's expected behavior changed, identify the requirement that changed it. For a visible change, use real screenshots or recordings when they demonstrate the outcome.
- Record how material review findings were resolved. Keep deferred findings, open questions, and remaining uncertainty visible.
- Follow any project rules for owner checks. Mark a required action complete only when the owner's result is recorded. Report verification, owner acceptance, and merge authorization as separate facts when applicable.
- Link to accessible GitHub issues, checked code revisions, CI runs, and evidence when available. Keep owner actions and material limitations visible outside disclosures.
