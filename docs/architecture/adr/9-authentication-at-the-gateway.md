---
sidebar_position: 18
---

# [ADR-9] Authenticate at the Gateway with Keycloak-Issued JWTs

## Context and Problem Statement

Requests have to be authenticated, and the services need to know which user is acting and with which role.
The gateway is already the single entry point for the frontend ([ADR-2](/architecture/adr/use-graphql-api-gateway)), which raises the question of where authentication happens and how the identity of the caller reaches the services behind it.

## Decision Drivers

- token verification should not have to be implemented in each of the language stacks used by the services (see [ADR-4](/architecture/adr/service-autonomy))
- the services need the acting user and its roles in order to authorize operations
- user accounts should not be managed by the shop services themselves

## Considered Options

- verify the token at the gateway and forward the resolved user to the services
- have every service verify the token itself
- verify the token at the ingress in front of the gateway

## Decision Outcome

Chosen option: "verify the token at the gateway and forward the resolved user to the services", because
it keeps token handling in one place while still giving each service the information it needs to authorize.

Keycloak is the identity provider. The gateway verifies the bearer token against Keycloak's published signing keys, which it retrieves through dapr service invocation ([ADR-8](/architecture/adr/use-dapr)). Verification is applied to all operations by default, so an operation is reachable without a valid token only if it is explicitly public.

From the token the gateway resolves the subject and the roles it recognises, currently `admin`, `employee` and `buyer`. It then forwards both the original authorization header and the resolved user to the service, so the service can authorize the operation without verifying the token again. New user accounts become known to the services through the `user/user/created` event, which several services import as described in [ADR-6](/architecture/adr/check-entity-consistency).

### Consequences

- Good, because token verification and role resolution are implemented once instead of once per language stack.
- Good, because the services implement authorization only, and receive the user and roles as already-resolved input.
- Good, because user accounts, credentials and password hashing are the responsibility of Keycloak rather than of the shop services.
- Neutral, because the set of roles is defined at the gateway, so adding a role affects the gateway as well as the services that use it.
- Bad, because the services trust the identity headers set by the gateway, so they must not be reachable directly from outside the cluster.
- Bad, because authentication adds another responsibility to the gateway, which is on the critical path of every authenticated request, and Keycloak has to be reachable for its signing keys.

## Pros and Cons of the Other Options

### Every service verifies the token itself

- Good, because no service has to trust another component's assertion about the caller
- Good, because a service is safe even if it is reachable directly
- Bad, because token verification has to be implemented and kept up to date in every language stack
- Bad, because every service needs to reach the identity provider for its signing keys

### Verify at the ingress in front of the gateway

- Good, because unauthenticated requests are rejected before entering the cluster
- Neutral, because the gateway would still have to resolve roles for authorization
- Bad, because the ingress cannot decide per operation, while a single GraphQL endpoint requires exactly that
