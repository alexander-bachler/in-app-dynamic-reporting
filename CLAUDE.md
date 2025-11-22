# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo for LineMetrics' in-app dynamic reporting tool. It uses npm workspaces to manage multiple React-based reporting applications that visualize LineMetrics platform data.

## Architecture

### Monorepo Structure

The project is organized into three main categories under `apps/`:

- **`apps/shared/api-client`**: Shared TypeScript API client package (`@project/api-client`) that handles OAuth authentication, API requests, and caching for LineMetrics API v2. All reports depend on this package.
- **`apps/accounts/*/*`**: Account-specific reports organized by accountId, then report name (e.g., `apps/accounts/1994/example`)
- **`apps/global/*`**: Global reports accessible across accounts (e.g., `co2`, `energy`, `energiebericht`, `kirchen`)
- **`apps/examples/*`**: Example/template reports for creating new reports

### API Client (`@project/api-client`)

The shared API client provides:
- OAuth 2.0 client credentials flow authentication
- LRU caching for API responses (devices, measuring points, data)
- Methods for fetching devices, inputs, objects, measuring points, and time-series data
- Runtime configuration via `window.env.REACT_APP_BASE_URL`

All reports should use this shared package for API interactions.

### Report Structure

Each report is a standalone Create React App with:
- Custom `BUILD_PATH` in `package.json` scripts pointing to `../../../build/<category>/<report-name>`
- `public/index.html` that includes `../../config.js` (or `../../../config.js` for account reports) for runtime configuration
- Dependency on `@project/api-client` for API access
- Optional `report_menu.json` for navigation menus

## Common Development Commands

### Install Dependencies
```bash
npm install
```

### Run a Specific Report (Development)
```bash
npm run start --workspace=<report-name>

# Example:
npm run start --workspace=example-reporting
```

### Build All Reports
```bash
npm run build
```

### Build with Docker
```bash
docker-compose up --build
```

Access reports at: `http://localhost:1000/<folder>/<report-name>/index.html`

### Test a Specific Report
```bash
npm run test --workspace=<report-name>
```

### Build Shared API Client
```bash
cd apps/shared/api-client
npm run build
```

## Creating a New Report

1. Create new feature branch from `main`
2. For account-specific report:
   - Create folder: `apps/accounts/<accountId>/<report-name>`
   - Copy from: `apps/examples/example`
3. Update `package.json`:
   - Set `name` field to report name
   - Update `scripts.build` field with correct `BUILD_PATH` to `./build/<category>/<report-name>`
4. For development, copy `.env` from example and update with correct credentials:
   - `REACT_APP_CLIENT_ID`
   - `REACT_APP_CLIENT_SECRET`
5. Update `public/index.html` line 8 to include config.js with correct relative path:
   - Example reports: `../../config.js`
   - Account reports: `../../../config.js`
6. Start development server and test
7. Verify with Docker build before deployment

## Deployment

### Version Management

**Docker Image Version**: Update `SERVICE_VERSION` in `Dockerfile`:
```dockerfile
ARG SERVICE_VERSION="0.0.7"  # Increment to 0.0.8
```

**Helm Chart Version** (only if deployment config changes): Update `version` in `chart/Chart.yaml`:
```yaml
version: 0.0.12  # Increment to 0.0.13
```

### CI/CD

Deployment is automated via GitLab CI/CD pipeline (`.gitlab-ci.yml`):
- **Development**: Deploys to RKE2 cluster (dev-rke2) in namespace `lm-dynamic-reporting`
- **Production**: Deploys to K3S cluster (prod-k3s-lm3) in namespace `dynamic-reporting`

Pipeline triggers on version changes in `Dockerfile`.

### Build Process

The Docker build:
1. Installs dependencies and builds all workspace reports
2. Runs `copyReportMenus.sh` to copy `report_menu.json` files to build directory
3. Creates nginx-based image serving all reports from `/usr/share/nginx/html/apps/`
4. Runtime configuration injected via `config.js_template` mounted as volume

## Key Configuration Files

- **`config.js_template`**: Runtime configuration template for `REACT_APP_BASE_URL` (injected at deployment)
- **`report_menu.json`**: Navigation menu structure for reports
- **`.env`**: Local development credentials (not committed)
- **`docker-compose.yml`**: Local development environment with nginx serving on port 1000

## Workspace Management

Install dependency for all workspaces:
```bash
npm install --workspaces <package-name>
```

Install dependency for specific workspace:
```bash
npm install <package-name> --workspace=<report-name>
```
