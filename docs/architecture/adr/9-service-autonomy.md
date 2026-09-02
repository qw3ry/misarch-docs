---
sidebar_position: 16
---

# [ADR-9] Service-Owned Databases and Per-Service Technology Stacks

## Context and Problem Statement

Each bounded context is implemented by its own service.
Two related questions follow: do the services share persistence, and do they share an implementation stack?
Both determine how independently a service can be developed, deployed and operated, so they are recorded together.

A shared database was already excluded when the catalog and category services were merged, where it is listed as "not up to discussion" (see [ADR-3](/docs/docs/architecture/adr/merge-category-and-product-service)).

## Decision Drivers

- a service should be deployable and scalable without coordinating with other services
- as a reference architecture, MiSArch should show that the decomposition does not depend on one specific stack
- the amount of infrastructure and tooling the team has to operate

## Considered Options

- each service owns its database, and each service chooses its own language, framework and database technology
- each service owns its database, but all services use one prescribed stack
- the services share one database

## Decision Outcome

Chosen option: "each service owns its database, and each service chooses its own stack", because
it makes the services independent in both dimensions, and it demonstrates that the architecture does not rely on a single technology choice.

Three stack combinations are in use:

| Stack                   | Database   | Services                                                              |
| ----------------------- | ---------- | --------------------------------------------------------------------- |
| Kotlin with Spring Boot | PostgreSQL | address, catalog, discount, notification, return, shipment, tax, user |
| Rust with axum          | MongoDB    | invoice, order, review, shoppingcart, wishlist                        |
| TypeScript with NestJS  | MongoDB    | inventory, payment                                                    |

The media service uses Rust with axum and stores objects in MinIO. The gateway is TypeScript with GraphQL Mesh, and the frontend is Vue (see [ADR-1](/docs/docs/architecture/adr/use-monolithic-frontend)).

Because no service can read another's database, data from another bounded context is obtained through events and kept locally, as recorded in [ADR-6](/docs/docs/architecture/adr/check-entity-consistency).

### Consequences

- Good, because a service can be deployed, scaled and migrated without coordinating with other services, and no service is blocked by another's schema migration.
- Good, because each context can use the persistence model that suits it, and the relational and document cases are both exercised.
- Neutral, because data from other contexts is available only as previously imported copies, which is the mechanism [ADR-6](/docs/docs/architecture/adr/check-entity-consistency) already describes.
- Bad, because there are no queries and no transactions spanning contexts, so consistency between contexts is eventual.
- Bad, because three language stacks and two database technologies multiply the build, dependency, upgrade and monitoring effort.
- Bad, because a cross-cutting concern has to be implemented once per stack. A decision such as the pagination contract ([ADR-5](/docs/docs/architecture/adr/pagination)) therefore relies on convention rather than on shared code.
- Bad, because a developer cannot move freely between services without learning another stack.

## Pros and Cons of the Options

### database per service, stack chosen per service

- Good, because maximum independence: a service shares neither schema nor runtime with any other
- Good, because it shows the architecture is not tied to one stack, which is a goal of a reference architecture
- Neutral, because the choice per service is in practice a choice among a few established combinations rather than a free one
- Bad, because every cross-cutting concern is implemented several times
- Bad, because the operational surface grows with each additional stack

### database per service, one prescribed stack

- Good, because services stay independently deployable while cross-cutting concerns can be solved once, for example in a shared library
- Good, because lower operational and cognitive overhead, and developers can move between services
- Bad, because the reference architecture would demonstrate only one technology choice
- Bad, because a context whose data does not fit the prescribed database has no good option

### shared database

- Good, because queries and transactions across contexts are possible, and there is one database to operate
- Bad, because services become coupled through the schema, so they can no longer be changed or deployed independently
- Bad, because it undermines the bounded contexts the decomposition is based on

## More Information

This record was written retrospectively, from the service documentation and the implementation. It aggregates two decisions, persistence ownership and implementation stack, because they were not recorded separately and they jointly define how independent a service is. The original reasoning was not documented at the time and should be corrected by the team where this account is wrong.
