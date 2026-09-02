---
sidebar_position: 1
---

# [ADR-1] Use Monolithic Frontend

## Context and Problem Statement

We consider two different ways of building our frontend: either a micro frontend, or a monolithic frontend.

## Considered Options

- micro frontend
- monolithic frontend

## Decision Outcome

Chosen option: "monolithic frontend", because

- with the given resources (5 developers) and experiences, a monolithic frontend is easier to implement and thus allows us to focus on more important aspects

### Consequences

- Good, because we do not need to consider requirements of a micro frontend with respect to the API gateway
- Neutral, because there is a single repository for the frontend.
- Good, because the frontend tech stack can be chosen rather _freely_. We decided to use Vue with Vuetify to create a single page web application.
- Neutral, because all services have to support the API gateway for the frontend.
- Bad, because results in whole stack not being "micro" end-to-end

## Pros and Cons of the Other Options

### Micro frontend

- Good, because would result in our whole stack to be "micro" from end-to-end
- Good, because would frontends of services to be developed independently
- Bad, because more difficult to implement, in particular with regard to given resources
- Bad, because there are several frontend components, which are not clearly associated with a specific backend service
