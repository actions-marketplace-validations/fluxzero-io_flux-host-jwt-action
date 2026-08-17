This release moves OIDC mode to Fluxzero's provider-neutral Integration exchange.

- Calls `/api/integrations/exchange-token` instead of the legacy GitHub endpoint.
- Preserves the existing `token`, `userId`, `deploy-token`, and `registry-host` outputs.
- Keeps `image-name` as an accepted compatibility input, but no longer requires or sends it.
- Adds an executable contract test for the bundled action and exchange interface.
