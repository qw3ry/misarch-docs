---
sidebar_position: 10
---

# [ADR-6] Check Entity Consistency

## Context and Problem Statement

When creating a relation between entities of different services, we need to check if the referenced related entities managed by a different service are valid to use.
Most importantly, does the given ID actually refer to an entity.

## Considered Options

- import related entities into service by listening to dapr creation events created by the owning service
- send a request to the owning service to verify that the entity with a given ID is valid

## Decision Outcome

Chosen option: "import related entities into service by listening to dapr creation events created by the owning service", because
results in more loose coupling, as we don't have synchronous requests between services when creating the relations.
Note that there might be exceptions in cases where this approach is not applicable.

### Consequences

- Good, because services are more loosely coupled: creating a relation requires no synchronous request to the service that owns the referenced entity.
- Neutral, because importing entities reduces communication overhead when an imported entity is referenced more than once on average, but increases it when it is referenced less than once.
- Bad, because delayed events, such as deletion events, can cause temporary inconsistencies.

## Pros and Cons of the Other Options

### Send a request to the owning service to verify that the entity with a given ID is valid

- Good, because results in stricter consistency: always validates current state
- Neutral, because potentially more/less events/requests: reduces communication overhead when related entity is on average used less than once, otherwise increases overhead
- Bad, because results in tight coupling between services: relation to foreign entity can only be created if synchronous request to other service is successful
