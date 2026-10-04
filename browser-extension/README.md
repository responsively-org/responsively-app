# Responsively Helper

Browser extension (Manifest V3) that opens the current page in the [Responsively App](https://responsively.app) via the `responsively://` protocol.

## Development

```bash
npm ci
npm run start    # development build with watch
npm run build    # production build into dist/
npm run lint     # validate dist/ with web-ext (AMO validator)
npm run package  # zip dist/ into web-ext-artifacts/ for store upload
```

Load `dist/` as an unpacked extension in Chrome (`chrome://extensions` → Load unpacked) or run `npx web-ext run --source-dir=dist` for Firefox.

## Publishing

Bump `version` in both `package.json` and `public/manifest.json`, merge to `main`, then run the **Publish Browser Extension** workflow from the Actions tab (choose `both`, `chrome`, or `firefox`).

Create a `chrome-web-store` environment and allow deployments from `main`. Its variables are:

| Variable | Where to get it |
| --- | --- |
| `CWS_PUBLISHER_ID` | Chrome Web Store developer dashboard |
| `CWS_WIF_PROVIDER` | Google Cloud Workload Identity Federation provider resource name |
| `CWS_SERVICE_ACCOUNT` | Email address of the Google service account with Chrome Web Store publisher access |

Configure [Workload Identity Federation](https://github.com/hamzahamidi/publish-to-chrome-web-store#setting-up-workload-identity-federation) and restrict its provider to this repository, the `chrome-web-store` environment, and `main`. Run the publishing workflow from `main`.

Use `target: chrome` with `dry_run_chrome: true` to check Chrome access and package version before uploading.

The workflow needs these repository secrets:

| Secret | Where to get it |
| --- | --- |
| `CWS_EXTENSION_ID` | Chrome Web Store developer dashboard, the extension ID |
| `AMO_JWT_ISSUER` / `AMO_JWT_SECRET` | [AMO API credentials](https://addons.mozilla.org/en-US/developers/addon/api/key/) |

Notes:

- The Chrome Web Store API can only update an existing listing. If the listing was removed (e.g. the MV2 deprecation takedown), the first MV3 upload may need to be done manually in the dashboard; CI handles every publish after that.
- Chrome Web Store API v2 uses the listing visibility configured in the developer dashboard.
- The AMO listing ID is pinned in `public/manifest.json` under `browser_specific_settings.gecko.id` and must not change.
- Both stores reject re-uploads of an already-published version — forgetting the version bump fails the workflow with a clear error.
