# Bind the agent's network probes to a source IP

`source-ip.patch` applies to cfsm-agent commit `9ed6ef3f783f9bd8a269fa44026cc9cc958e392f` (the v1.0.18 source already deployed on HeptaSky-GZ-1). It adds the optional local environment variable `CF_PROBE_PING_SOURCE_IP` to TCP, HTTP and ICMP probes. Reporting, public-IP discovery and update transports keep their existing routes. This is a local patch, not an upstream configuration option.

Invalid, unspecified or multicast addresses are rejected. Unassigned addresses and IP-family mismatches produce failed probes; there is no fallback to the default source. A missing variable retains normal routing. The source address must belong to the host. This measures source-bound outbound round trips, not an independent inbound test from each ISP.

## Build

Use the agent checkout's existing Nix Go environment (verified Go 1.26.10, GOTOOLCHAIN=local), retain go.mod/go.sum, apply this patch, then run within that environment:

```sh
git apply --check /path/to/source-ip.patch
git apply /path/to/source-ip.patch
go test ./...
go test -race ./internal/cfprobe -run 'Test(ProbeSourceValidation|TCPProbeSourceBinding|HTTPProbeSourceDoesNotChangeOtherTransports)$'
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -trimpath \
  -ldflags='-s -w -X main.version=v1.0.18-entry1' \
  -o cf-probe-entry-linux-amd64 ./cmd/cf-probe
```

Do not run the upstream installer over an existing deployment to apply this change. Back up the running binary and config; replace only the binary and add a dedicated systemd drop-in. Restart only cf-probe. Keep automatic updates disabled until a future build retains or replaces this source-binding feature.

## HeptaSky deployment — 2026-11-18 (UTC+8)

At 01:43:19 (2026-11-17T17:43:19Z), HeptaSky-GZ-1 switched its probe source from the default 209.248.12.8 to entrance 128.108.221.182. Both addresses are on eth0. The global Guangdong CT/CU/CM destinations, measurement mode, resource collection, reporting and traffic history remain unchanged. Latency samples before this time describe the old source route.

Drop-in `/etc/systemd/system/cf-probe.service.d/20-source-ip.conf`:

```ini
[Service]
Environment=CF_PROBE_PING_SOURCE_IP=128.108.221.182
```

Agent version: `v1.0.18-entry1`.

- Before SHA-256: `18ab3be0b721df79645646f210448d5778c8c740a03583c725180d5a8ece1af8`.
- After SHA-256: `263e9215d0de82f6ea32fcdee5707c24f90b4ba0a64779b644a29b0f67409021`.

Private local evidence is in `~/.local/state/ppanel/deployments/20261118-hepta-entry-monitor/`. The server's original binary/config and exact rollback script are in `/root/cf-entry-monitor-20261118/`. Rollback restores only the original binary and removes this drop-in, then reloads systemd and restarts cf-probe. It does not restore old traffic counters or other services' configurations.

Validation: source-binding tests and the upstream Go suite passed; the targeted tests also passed with the race detector. A three-sample comparison against the same resolved destinations measured entrance-source CT 7–9 ms, CU 5–6 ms, CM 10–21 ms; the default source was 209.248.12.8 and measured approximately 216–451 ms. These are short-window observations, not a long-term latency guarantee.

Live validation also observed two outgoing TCP SYNs to each of the three actual ISP destinations in 45 seconds, all using source 128.108.221.182. The live dashboard and public API show the new version and approximately 6/6/15 ms; monthly RX/TX counters continue increasing. The unchanged config hash, routing/rules and other running service PIDs were checked. The deployment rollback timer was cancelled after acceptance.
