# Deployment

The Docker compose files in this directory launch the supporting services for CashuCast.

## Environment variables

Set `SSB_APP_KEY` to the base64-encoded capability string used by the Secure Scuttlebutt network before building or deploying the web application. The same value should be provided to the CI workflow as the `SSB_APP_KEY` secret.

