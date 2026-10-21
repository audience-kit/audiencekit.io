---
title: Automate with service tokens
description: Create, use and revoke service tokens, and upsert venues and events in batches with provenance.
sidebar:
  order: 3
---

Service tokens let a machine, such as a laptop running the [researcher worker](/guides/researcher/), read and write one audience's venues and events without a person signed in.

## Create a token

Run this on a machine with access to the API's database:

```sh
cd api
bin/rails service_token:create AUDIENCE=lgbt NAME="rick macbook researcher"
```

| Variable | Required | Meaning |
| --- | --- | --- |
| `AUDIENCE` | Yes | The audience's subdomain. If no audience has it, the task creates one. |
| `NAME` | Yes | A label so you can tell tokens apart. |
| `AUDIENCE_NAME` | No | The name for a newly created audience. Defaults to the subdomain in capitals. |
| `SCOPES` | No | Comma-separated scopes. Defaults to all of them: `research:read,places:write,events:write`. |
| `EXPIRES_IN_DAYS` | No | Expire the token after this many days. By default it never expires. |

The task prints the secret, shaped like `akst_<prefix>_<secret>`, **once**. Only a SHA-256 digest is stored, so copy it somewhere safe right away.

List tokens with `bin/rails service_token:list` and revoke one with `bin/rails service_token:revoke ID=<uuid>`. Revoking takes effect on the next request, even for JWTs already issued.

## Use a token

Exchange the secret for a JWT, then send it on each request. Mint a new JWT when it expires after an hour.

```sh
JWT=$(curl -s https://api.audiencekit.io/v1/token/service \
  -H "Content-Type: application/json" \
  -d "{\"service_token\": \"$AUDIENCEKIT_SERVICE_TOKEN\"}" | jq -r .token)

curl https://api.audiencekit.io/v1/research/snapshot -H "Authorization: JWT $JWT"
```

## Upsert venues and events

`POST /v1/research/batch` creates or updates venues and events in one transaction. Each record is matched by an `external_key` you choose (unique per audience for venues, and per venue for events), so sending the same batch twice is safe.

```json
{
  "batch": { "model": "qwen/qwen3-30b-a3b", "worker_version": "0.1.0", "notes": "Weekly pass" },
  "venues": [
    {
      "external_key": "seattle/the-wildrose",
      "name": "The Wildrose",
      "locale": "seattle",
      "address": "1021 E Pike St, Seattle, WA 98122",
      "latitude": 47.6142,
      "longitude": -122.3191,
      "website": "https://example.com",
      "confidence": 0.9,
      "source_urls": ["https://example.com/about"]
    }
  ],
  "events": [
    {
      "external_key": "seattle/the-wildrose/2026-10-09-trivia",
      "venue_external_key": "seattle/the-wildrose",
      "name": "Trivia night",
      "start_at": "2026-10-09T19:00:00-07:00",
      "confidence": 0.8,
      "source_url": "https://example.com/events"
    }
  ]
}
```

Venues name their locale with `locale` (a label), `locale_id` or `locale_name`, and can also set `description`, `hidden`, `google_place_id`, `verified_at` and `provenance`. Events name their venue with `venue_id` or `venue_external_key`, and can also set `description`, `end_at`, `ticket_url`, `is_canceled`, `verified_at` and `provenance`.

The response reports what happened to each record:

```json
{
  "batch_id": "…",
  "dry_run": false,
  "stats": { "venues": { "created": 1 }, "events": { "created": 1 } },
  "venues": [{ "external_key": "seattle/the-wildrose", "id": "…", "status": "created" }],
  "events": [{ "external_key": "seattle/the-wildrose/2026-10-09-trivia", "id": "…", "status": "created" }]
}
```

Each record's `status` is `created`, `updated`, `unchanged` or `error`. A record that can't be saved comes back with its `errors`, and the rest of the batch still applies.

Add `?dry_run=true` to validate a batch and see the same results without writing anything. A dry run returns `200 OK` and a `batch_id` of `null`; a real run returns `201 Created`.
