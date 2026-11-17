# Product

## Platform

web

## Users

The owner monitors their VPS fleet; visitors can view the public status dashboard. Administration requires login.

## Product Purpose

Show current server health, resource consumption, network traffic, latency, and historical measurements. Help the owner identify an offline or overloaded server and inspect its details.

## Operating Context

The site is deployed at status.academic.ac on Cloudflare Workers, D1, and Durable Objects. The dashboard respects the configured site and server visibility.

## Capabilities and Constraints

Preserve the existing Vue application, monitoring API, WebSocket updates, four dashboard views, regional filters, historical charts, theme and language controls, and authenticated management operations. Do not change server configuration or invent measurements. Existing site title and attribution remain.

## Brand Commitments

The Vue interface uses the shadcn-vue registry components and neutral light and dark themes. Monitoring-specific colours distinguish server states and metric thresholds.

## Evidence on Hand

Use local fixtures to test administration without changing live data. Source and behavior are documented in README.md and API.md. No commercial claims are required.

## Product Principles

- Real operational state leads the interface.
- Keep monitoring and navigation fast to scan.
- Preserve desktop, mobile, Chinese, English, light, and dark usage.
- Keep cosmetic changes separate from monitoring and agent behavior.
