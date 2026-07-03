# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [2.2.1] - 2026-07-03

### Fixed
- Shortened the Action metadata description so GitHub Marketplace validation can publish the release.

### Changed
- Runs the action on GitHub's `node24` JavaScript action runtime.
- Verifies compatibility on Node.js 20, 24, and 26.
- Uses Node.js 26 for the bundled `dist` build in CI.
- Updates Actions toolkit, JWT, TypeScript, ESLint, and related dependencies.
- Updates workflows to `actions/checkout@v6` and `actions/setup-node@v6`.
- Documents runtime defaults, Node.js 26 compatibility, and the temporary Node.js 20 override behavior.

## [2.1.0] - 2026-06-30

### Added
- `audience` input to override the OIDC audience claim, allowing connection to different cloud environments (defaults to `https://cloud.fluxzero.io`)
- OIDC mode for secretless GitHub Actions authentication via GitHub OIDC token exchange
- `image-name` input for specifying the Docker image name during OIDC token exchange
- `fluxzero-host` input for overriding the Fluxzero API endpoint
- `deploy-token` and `registry-host` outputs in OIDC mode

## [2.0.0] - 2026-03-01

### Changed
- Renamed project to Fluxzero
