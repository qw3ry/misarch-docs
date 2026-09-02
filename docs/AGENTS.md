---
# This is only for Agents and not part of the public documentation.
draft: true
---
# AGENTS.md

## Purpose
This repository contains LLM-ready requirements, architecture documents, and diagram sources for MiSArch.

## Corpus Layout
- `overview.mdx`: starting point for broad system context.
- `requirements/`: domain, use-case, business-process, and quality requirements.
- `architecture/`: architecture overviews, service descriptions, and ADRs.
- `diagrams/`: source diagrams in Hylimo, Mermaid, and BPMN.

## Operating Guidance
1. Use `overview.mdx` to identify relevant Markdown files.
2. Prefer Markdown documents for direct factual answers.
3. Use `<CustomImage />` tags in the Markdown files to find supporting diagrams. Use the diagram source, not the rendered image.
4. When a document references a diagram, consult both before concluding.
5. Treat ADRs as decision rationale, not as exhaustive system behavior.

## Constraints
- Do not infer undocumented implementation details.
- If the corpus is ambiguous or silent, say so clearly.
- Prefer prose to raw diagram syntax when they conflict or when diagram syntax is unclear.
- Diagram files are supporting evidence and may omit explanatory context that exists in Markdown.

## Citation Style
When citing repository content, reference repository-relative paths such as:
- `overview.mdx`
- `requirements/use-cases.mdx`
- `architecture/services/order.md`
- `diagrams/services/orderDomainModel.hyl`

## Retrieval Heuristics
- For requirements questions, check `requirements/` first.
- For service responsibilities, APIs, events, and dependencies, check `architecture/services/`.
- For workflows, business processes, or journeys, check both `requirements/` and `diagrams/`.
- For architectural rationale, check `architecture/adr/`.
