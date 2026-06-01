---
sidebar_position: 8
---

# Health endpoint

Every service exposes a health check endpoint under `GET /health`.
When the service is healthy, a `200 OK` status is returned.
When the service is unhealthy, a `5XX` status is returned.
