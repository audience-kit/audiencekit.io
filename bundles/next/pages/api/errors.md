---
title: Errors
description: HTTP status codes and error bodies returned by the AudienceKit API.
sidebar:
  order: 8
---

## HTTP status codes

| Status | Meaning |
| --- | --- |
| `400 Bad Request` | The request was malformed. A failed sign-in returns `{ "fault": { "message": "…" } }`; the research endpoints return `{ "error": "audience required" }` when an admin doesn't name an audience. |
| `401 Unauthorized` | Credentials are missing, malformed or invalid, or the endpoint needs an admin. The body is `{}`, or `{ "error": "invalid_service_token" }` from `/v1/token/service`. |
| `403 Forbidden` | The credentials are valid but not allowed here: an API key on another audience's endpoint, or a service JWT without a required scope (`{ "error": "insufficient_scope", "required": "research:read" }`). |
| `404 Not Found` | The audience, record or host doesn't exist. |

## GraphQL errors

GraphQL requests return `200 OK` with an `errors` array when an operation fails, following the [GraphQL spec](https://spec.graphql.org/October2021/#sec-Errors):

```json
{
  "data": { "updateAudienceTheme": null },
  "errors": [
    {
      "message": "Error saving audience",
      "path": ["updateAudienceTheme"],
      "extensions": { "theme": ["light on-accent on accent has contrast 3.21:1; it needs 4.5:1"] }
    }
  ]
}
```

When a mutation fails validation, `extensions` maps each field to its messages. Show people what to fix rather than the raw message.

Common messages:

- "Administrator access required": the mutation needs an admin JWT.
- "Audience not found": `audienceId` doesn't name an audience.
- "audienceId does not match the endpoint audience": the mutation named a different audience than the endpoint's.
