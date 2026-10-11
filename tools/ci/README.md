# CI And Image Publishing

This repository validates the editor and builds/pushes Studio and docs images.
Hosting, reverse-proxy images, TLS, release bundles, deployment and rollback are
owned separately. Contributor setup requires only Node.js 24 and npm, not
production credentials or a deployment checkout.

## Local CI

Run from the repository root:

```sh
bash tools/ci/act.sh list
bash tools/ci/act.sh job build
```

The wrapper supports `lint`, `test`, `build` and `docs-check` from
[the CI workflow](../../.github/workflows/ci.yml), through `act` or `gh act` with
Docker. It uses empty secret/env files and never selects image publishing or
deployment workflows. CI does not run the opt-in browser suite.

## Application Images

```sh
npm run build
docker build --tag apps-studio:local --file apps/studio/Dockerfile .
docker build --tag apps-docs:local --file apps/docs/Dockerfile .
docker image inspect apps-studio:local apps-docs:local
```

The image inputs are `dist/apps/studio/browser` and `dist/apps/docs`, plus each
application's Dockerfile and internal Nginx configuration. These containers serve
application files and health endpoints; they do not own public TLS termination.

[Release Images](../../.github/workflows/images.yml) validates both images on
`v*.*.*` tags and manual dispatch. Tags publish versioned and `latest` images to:

- `ghcr.io/sesan07/formly-editor-studio:<release>`
- `ghcr.io/sesan07/formly-editor-docs:<release>`

The namespace is derived from `github.repository` and normalized to lowercase,
so forks publish under their own owner/repository names. The source repository is
`sesan07/formly-editor`; deployment tooling lives separately in
`sesan07/formly-editor-deployment`.

Manual dispatch publishes only when `publish=true`, using the selected ref name
as the image tag; use a Docker-compatible ref name. Manual publishing does not
update `latest`. Publishing uses `GITHUB_TOKEN` with job-scoped `packages: write`.
It does not produce deployment bundles, contact a VPS, or require production
environment secrets. External deployment tooling consumes the published image
tags or digests independently.
