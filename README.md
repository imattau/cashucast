# CashuCast

CashuCast is a peer-to-peer media platform that combines [Cashu](https://cashu.space/) e-cash payments with
[Secure Scuttlebutt](https://scuttlebutt.nz/) and BitTorrent distribution.  The project ships as a browser-based
React application backed by a collection of web workers for wallet, gossip and torrent functionality.

## Features

- ⚡ **Integrated Cashu wallet** for minting and sending tokens.
- 📡 **Secure Scuttlebutt identity** and gossip network for discovering peers.
- 🌊 **BitTorrent-powered blob sharing** for media distribution.
- 🧩 Modular worker architecture (`worker-*` packages) enabling isolated, testable logic.
- 🧪 `vitest` unit tests and Playwright component tests.

## Development environment

Bootstrap a fresh Linux machine with all dependencies by running:

```bash
./scripts/setup_dev_env.sh
```

The script installs Node.js 20, pnpm and a container engine (Docker or Podman) before running
`pnpm install --frozen-lockfile`.  Depending on your system, container commands may require root
privileges or membership in the engine's group.  If you encounter permission errors, run the
commands with `sudo` or add your user to the appropriate group.

If you prefer to install the prerequisites manually, run the following commands on a fresh
Linux machine:

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# pnpm package manager
sudo npm install -g pnpm

# Container engine (choose one)
sudo apt-get install -y podman podman-compose
# or
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo apt-get install -y docker-compose-plugin
rm get-docker.sh

# Project dependencies
pnpm install --frozen-lockfile
```

To start the development stack manually:

```bash
./scripts/dev.sh
```

This boots supporting containers (room server, tracker and regtest mint), installs dependencies and runs the
Vite development server for the web app.

The web app's development script removes any existing Vite cache (`node_modules/.vite`) before
starting so changes are always picked up on launch.

### Environment variables

Create an `.env` file in `apps/web` to configure the web app and SSB worker:

- `SSB_APP_KEY` – Base64-encoded capability string used to join the Secure Scuttlebutt network. This value must match the room server's app key.
- `VITE_DHT_URL` – WebSocket URL of the DHT bootstrap node. Defaults to `ws://localhost:6881`.

An example file is provided at `apps/web/.env.example`.

## Running tests

Unit tests can be run with the helper script:

```bash
./scripts/test.sh
```

It wraps the `pnpm test` command and prints friendly status messages before and after execution.

## Deploying to a server

A one-shot installer is provided for Ubuntu 24.04 VPS environments.  On a fresh server run:

```bash
curl -sL https://raw.githubusercontent.com/<your-org>/cashucast/main/scripts/install_server.sh | bash
```

The script installs Caddy, a container runtime, fetches this repository and launches the production Docker
Compose stack located under `infra/docker`.

Set the `SSB_APP_KEY` environment variable (base64 encoded) before building or deploying the web app. In CI, store this value as a secret named `SSB_APP_KEY`.

## Helper scripts

The `scripts/` directory contains small utilities with user-friendly output:

| Script | Description |
| ------ | ----------- |
| `build.sh` | Build the production web bundle and worker packages. |
| `dev.sh` | Start local containers and run the web app with hot reload. |
| `install_server.sh` | Provision and launch the application on an Ubuntu server. |
| `quicktest.sh` | Spin up the development stack and expose it on the LAN. |
| `setup_dev_env.sh` | Install Node.js, pnpm and a container engine on Linux. |
| `test.sh` | Run unit tests with status messages. |

Additional helper scripts can be added to this folder as needed, for example to run linting, database
migrations or other maintenance tasks.  Make sure each script prints clear feedback so developers know what
is happening and when the task has finished.

## Contributing

Contributions are welcome!  Please run `./scripts/test.sh` before submitting a pull request.
