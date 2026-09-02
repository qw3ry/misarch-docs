---
sidebar_position: 12
---

# [ADR-7] Checkout Process Coordination and Retry Handling

## Context and Problem Statement

The buy process spans several services: an order has to reserve inventory, validate its discounts, be paid, be invoiced and be shipped.
Each of these steps is a local transaction in a different service with its own database, so there is no shared transaction that could cover the whole process.
We need to decide how the steps are coordinated, and what happens when one of them fails.

## Considered Options

- choreography: each service subscribes to the event concluding the previous step and publishes its own outcome, with compensation triggered by the service that detected the failure
- orchestration: a dedicated component drives the steps, tracks the state of the process and triggers compensation centrally
- retry failed steps indefinitely, and communicate only unrecoverable failures as events
- retry failed steps up to n times, and treat exhaustion as an unrecoverable failure

## Decision Outcome

Chosen options: "choreography" and "retry failed steps indefinitely, and communicate only unrecoverable failures as events", because
they follow the loose coupling already established by [ADR-6](/architecture/adr/check-entity-consistency): we do not introduce a component that all participants depend on, and we do not need synchronous calls between the participating services.

Two classes of error are assumed:

- transient errors, which are retried until they succeed, on the assumption that a temporarily unavailable service becomes available again after some time
- final failures, which are published as a dedicated event so that the affected services can undo their local work

The resulting process is essentially linear, and it is documented in [Order Saga and Failure Model](/architecture/checkout).

### Consequences

#### Choreography

- Good, because no participant depends on a coordinator being available, and adding a step means subscribing to an existing event rather than changing a central definition.
- Neutral, because the state of the process is not stored anywhere as a whole. In a linear saga the position in the process follows from the last event published.
- Bad, because the services are temporarily inconsistent with each other while the saga runs, and while a compensation propagates.
- Bad, because verifying that every failure path is handled requires inspecting all participating services.
- Bad, because consumers can receive an event more than once, and therefore have to tolerate redelivery.
- Neutral, because the process is distributed across the events published and consumed by the participating services rather than described in one place.
- Bad, because a step that must wait for multiple predecessors requires additional bookkeeping, since no component holds the complete process state.

#### Indefinite Retries

- Good, because transient faults need no error handling in the participating services: the retry resolves them.
- Good, because no step is abandoned while its dependency is merely unavailable.
- Bad, because an error that is neither transient nor published as a final failure is retried for as long as it persists.
- Bad, because retries against an unavailable or saturated service add load to it.

## Pros and Cons of the Other Options

### Orchestration

- Good, because the process is defined in one place and its state is explicit, which makes parallel steps and joins straightforward
- Good, because compensation is decided centrally, based on the state of the whole process
- Bad, because every participant depends on the orchestrator
- Bad, because the orchestrator has to know about all participants, which couples it to each of them

### Retry failed steps up to n times, and treat exhaustion as an unrecoverable failure

- Good, because every step reaches a defined outcome, including errors that were not anticipated
- Neutral, because it requires deciding a bound, and a bound that is too low turns an ordinary outage into a failed order
- Bad, because it requires a place to put the events whose retries were exhausted, and a way to handle them
