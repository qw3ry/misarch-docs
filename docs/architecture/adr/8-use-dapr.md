---
sidebar_position: 14
---

# [ADR-8] Use Dapr for Inter-Service Communication

## Context and Problem Statement

The services need to call each other synchronously and to exchange domain events asynchronously.
They are implemented in different languages and frameworks (see [ADR-4](/architecture/adr/service-autonomy)), so whatever mechanism we choose has to be available in all of them.

## Decision Drivers

- the same communication mechanism has to be usable from Kotlin, Rust and TypeScript services
- services should address each other logically, not by host and port
- the underlying infrastructure should be replaceable without changing the services

## Considered Options

- dapr sidecar, using service invocation for synchronous calls and pub/sub for events
- direct HTTP or gRPC calls between services, plus a broker client library per language
- a service mesh for the synchronous traffic, plus a broker client library per language

## Decision Outcome

Chosen option: "dapr sidecar", because
it provides one communication API for all three language stacks, and it decouples the services from the concrete broker.

Every service instance runs a dapr sidecar. Synchronous calls use dapr service invocation and address the target by its application id. Asynchronous communication uses dapr pub/sub, where a service declares its subscriptions itself and dapr delivers matching events to the declared endpoint. This is the communication shown in the [component diagram](/architecture/component-diagram).

The pub/sub and state components are dapr components, so the backing technology is a deployment concern: the Kubernetes deployment uses Redis for both the event bus and the state store, while local development uses an in-memory pub/sub component.

### Consequences

- Good, because one communication API covers all language stacks, and no service needs a broker client library.
- Good, because the broker can be replaced without changing any service, which also allows a lightweight local setup.
- Good, because service discovery is handled by dapr, so services address one another by application id.
- Good, because a service declares its own subscriptions, so adding a subscriber does not require an infrastructure change.
- Neutral, because dapr is an additional platform that the team has to operate and understand, and every service instance runs an additional container.
- Bad, because delivery behaviour, including retry and redelivery, is determined by dapr and the configured component rather than by the services, so it has to be reasoned about at the platform level rather than per service.
- Bad, because the sidecar is on the path of every request between services.
- Bad, because it adds an operational dependency: if the sidecar or the event bus is unavailable, both synchronous and asynchronous communication are affected.

## Pros and Cons of the Other Options

### Direct HTTP or gRPC calls plus a broker client library per language

- Good, because no additional platform to operate
- Good, because full control over client behaviour, including retries and timeouts
- Bad, because every cross-cutting communication concern has to be implemented once per language stack
- Bad, because services become coupled to the concrete broker and to each other's addresses

### Service mesh plus a broker client library per language

- Good, because synchronous traffic gets retries, timeouts and telemetry without touching the services
- Neutral, because it covers only the synchronous half, so the asynchronous half still needs a client library per language
- Bad, because two mechanisms have to be operated and understood instead of one
