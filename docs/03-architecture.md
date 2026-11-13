# Architecture — Frappe decision

The approved direction is Next.js 16 / React / TypeScript frontend with a future custom Frappe Framework application. Frappe owns database persistence, authentication, role permissions, Python controllers/services/whitelisted methods and background jobs/workers. No backend, auth, database, payment or live integration is implemented in this repository. Earlier NestJS/Fastify, independent OIDC/PostGIS and BullMQ proposals are superseded, including historical report recommendations.

Read `12-architecture-contracts.md` for domain invariants and `22-frappe-backend-blueprint.md` for proposed DocTypes, relationships, isolation, roles, APIs, validation, concurrency and workers. `prototype-repository.ts` defines the typed frontend data-access boundary; only a browser-local adapter exists. No second backend framework is authorized.
