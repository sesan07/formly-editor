# Copilot Instructions: Formly Editor

The user is an experienced senior software engineer. Provide concise, high-signal technical responses focused on architecture, performance, and edge cases. Skip introductory tutorials, basic syntax explanations, and boilerplate pleasantries. Write functional, maintainable, performant, and accessible code.

## Communication And Scope

- Lead with concrete architectural context and trade-offs, then precise implementation details. Avoid redundant code.
- When refining a plan, identify unresolved scope, dependencies, or acceptance criteria and whether they block implementation. Once actionable, state that the plan is ready for implementation.
- Tie implementation updates to the current plan item and next step. State that implementation is complete only after relevant validation; disclose remaining gaps, blockers, and deferred work.
- Strictly implement only what was requested. Do not add unsolicited abstractions, speculative helper methods, or unrequested UI controls.

## Workspace And Architecture

Source code, tests, and current documentation in `apps/docs/src/content/docs/` define supported behavior. Start at `README.md` and `apps/docs/src/content/docs/developers/index.mdx`.

This is a root Angular CLI workspace with private npm workspaces:

- `apps/studio`: Browser-local Angular editor application and shell.
- `apps/docs`: Astro/Starlight public documentation site, built independently of Angular.
- `libs/core`: Formly-backed editor framework, normalized state, runtime primitives, layout panels, configuration, and serialization.
- `libs/ui/material`: Internal Material UI and Formly integrations.

Libraries are internal source-only modules. Import across libraries through their `@formly-editor/*` public barrels. Keep barrels limited to externally consumed symbols; do not export implementation details. Core must not depend on UI integrations or application code.

- Keep hierarchical editor state normalized using `nodeMap`, `rootNodeIds`, and existing adjacency metadata such as `parentId`, `childIds`, and `idPath`. Use pure immutable updates, indexed lookups, and existing path-recalculation utilities instead of mutating nested trees.
- When deleting fields, folders, or forms, clean parent references, root lists, and selection state without leaving orphan nodes.

## Workspace Commands

Run commands from the repository root with npm:

- Studio: `npm start`, `npm run build:studio`.
- Focused unit suites: `npm run test:studio`, `npm run test:core`, `npm run test:material`.
- Check `package.json` before suggesting other commands; archived commands are not supported setup instructions.

## TypeScript And Angular Standards

- Use strict type checking. Prefer inference when obvious; avoid `any`, using `unknown` and narrowing for uncertain values.
- Prefer interfaces for simple object definitions; use type aliases for unions, intersections, mapped types, and other type-level composition.
- Avoid unnecessary `Boolean(...)` coercion. Use direct boolean expressions for conditions, and prefer `!!value` when an explicit primitive boolean is required.
- Use standalone components only. Do not add `standalone: true`; it is the Angular 21 default.
- Explicitly set `changeDetection: ChangeDetectionStrategy.OnPush` on components. Keep components small and focused; prefer inline templates for compact components.
- Use `host` metadata for class and event bindings, never `@HostBinding` or `@HostListener`.
- Use `inject()` instead of constructor injection. Keep services focused on a single responsibility.
- Use `providedIn: 'root'` for singleton services.
- Use signals for local state and `computed()` for derived state. Use `linkedSignal()` when state derived from multiple reactive sources must stay synchronized. Keep transformations pure; use `.set()` or `.update()`, never in-place mutation or `.mutate()`.
- Use `input()` and `output()` for signal-based component communication. Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()` when that fits the component.
- Implement lazy loading for feature routes.
- Prefer reactive forms over template-driven forms.
- Use `NgOptimizedImage` for eligible static Angular images when the image is local and optimization matters. Do not force it for inline base64 or dynamic image sources.

## RxJS And Lifecycles

- Suffix every Observable, Subject, BehaviorSubject, ReplaySubject, and other RxJS stream value with `$`, regardless of visibility. Methods returning streams also end in `$`, such as `forms$`, `valueChanges$`, or `loadForms$()`.
- Do not suffix synchronous action methods returning `void`, even when they subscribe internally.
- Use the async pipe for template subscriptions where appropriate.
- When an owned subscription can outlive its component, directive, or service, use `takeUntilDestroyed()`. Outside an injection context, inject `DestroyRef` and pass it explicitly. Finite synchronous streams such as `of(...)` do not require lifecycle cleanup.
- Test subscriptions that can outlive a test must be explicitly completed or managed by a test lifecycle helper.

## Templates And Accessibility

- Keep templates simple. Use native `@if`, `@for` with explicit `track`, and `@switch` instead of legacy structural directives.
- Use `class` and `style` bindings instead of `ngClass` and `ngStyle`. External template/style paths must be relative to the component TypeScript file.
- Do not assume JavaScript globals or expressions such as `new Date()` are available in templates; expose required values from the component.
- Meet WCAG AA requirements, including focus management, contrast, ARIA labeling, and keyboard operation. Changes must pass all AXE checks.
- Avoid `stopPropagation()` where possible; prefer scoped handlers and use `preventDefault()` when suppressing browser default behavior is appropriate.

## Verification Discipline

- After code changes, run affected Vitest files with `npm exec -- vitest run <path>` or the relevant unit suite before concluding. Test observable behavior, lifecycle transitions, and state transformations, not implementation trivia.
- Ensure changes compile cleanly and preserve production build integrity with `npm run build:studio`.
- For visual or interaction changes, verify in the VS Code browser. Prefer reusing an already-open page; open a new page only when reuse is not possible or isolated state is needed.
- Playwright browser tests are opt-in via `npm run test:e2e`, using `apps/studio/playwright.config.ts`; install Chromium with `npx playwright install chromium` if needed. The suite includes an interaction timing smoke test.
- When changing workflows, CI install steps, Docker build inputs, or workflow fixtures, use `bash tools/ci/act.sh list`, then the narrowest supported job when Docker and `act` or `gh act` are available. Supported jobs are `lint`, `test`, `build`, and `docs-check`.
