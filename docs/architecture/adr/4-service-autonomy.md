---
sidebar_position: 6
---

# [ADR-4] Service-Owned Databases and Per-Service Technology Stacks

## Context and Problem Statement

Each bounded context is implemented by its own service.
Two related questions follow: do the services share persistence, and do they share an implementation stack?
Both determine how independently a service can be developed, deployed and operated, so they are recorded together.

## Decision Drivers

- a service should be deployable and scalable without coordinating with other services
- the amount of infrastructure and tooling the team has to operate

## Considered Options

- each service owns its database, and each service chooses its own language, framework and database technology
- each service owns its database, but all services use one prescribed stack
- the services share one database

## Decision Outcome

Chosen option: "each service owns its database, and each service chooses its own stack", because
it makes the services independent in both dimensions.

### Consequences

- Good, because a service can be deployed, scaled and migrated without coordinating with other services, and no service is blocked by another's schema migration.
- Good, because each context can use the persistence model that suits it, and the relational and document cases are both exercised.
- Neutral, because data from other contexts is available only as previously imported copies.
- Bad, because there are no queries and no transactions spanning contexts, so consistency between contexts is eventual.
- Bad, because multiple language stacks and two database technologies multiply the build, upgrade and operations effort.
- Bad, because a cross-cutting concern has to be implemented once per stack. A decision such as the pagination contract ([ADR-5](/architecture/adr/pagination)) therefore relies on convention rather than on shared code.
- Bad, because a developer cannot move freely between services without learning another stack.

## Pros and Cons of the Other Options

### Database per service, one prescribed stack

- Good, because services stay independently deployable while cross-cutting concerns can be solved once, for example in a shared library
- Good, because lower operational and cognitive overhead, and developers can move between services
- Bad, because a context whose data does not fit the prescribed database has no good option

### Shared database

- Good, because queries and transactions across contexts are possible, and there is one database to operate
- Bad, because services become coupled through the schema, so they can no longer be changed or deployed independently
- Bad, because it undermines the bounded contexts the decomposition is based on
