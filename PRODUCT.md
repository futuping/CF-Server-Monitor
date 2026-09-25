# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The owner monitors their VPS fleet; visitors can view the public status dashboard. Administration requires login.

## Product Purpose

Show current server health, resource consumption, network traffic, latency, and historical measurements. Help the owner identify an offline or overloaded server and inspect its details.

## Operating Context

The site is deployed at status.academic.ac on Cloudflare Workers, D1, and Durable Objects. Six Linux agents report live data. Riven-JP-1 and DMIT-JP-1 are intentionally excluded from deployment.

## Capabilities and Constraints

Preserve the existing Vue application, monitoring API, WebSocket updates, four dashboard views, regional filters, historical charts, theme and language controls, and authenticated management operations. Do not change server configuration or invent measurements. Existing site title and attribution remain.

## Brand Commitments

The owner explicitly requested Claude-inspired styling using the impeccable skill. Reference Claude's warm neutral surfaces, calm controls and serif heading character; do not imply affiliation or replace the project's identity with Claude branding.

## Evidence on Hand

The deployed six-server fleet supplies live data for verification. Source and behavior are documented in README.md and API.md. No commercial claims are required.

## Product Principles

- Real operational state leads the interface.
- Keep monitoring and navigation fast to scan.
- Preserve desktop, mobile, Chinese, English, light, and dark usage.
- Keep cosmetic changes separate from monitoring and agent behavior.
