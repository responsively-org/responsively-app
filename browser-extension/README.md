# Responsively Helper

Browser extension (Manifest V3) that opens the current page in the [Responsively App](https://responsively.app) via the `responsively://` protocol.

## Development

```bash
npm install
npm run start    # development build with watch
npm run build    # production build into dist/
npm run lint     # validate dist/ with web-ext (AMO validator)
npm run package  # zip dist/ into web-ext-artifacts/ for store upload
```

Load `dist/` as an unpacked extension in Chrome (`chrome://extensions` → Load unpacked) or run `npx web-ext run --source-dir=dist` for Firefox.

## Publishing

Bump `version` in both `package.json` and `public/manifest.json`, merge to `main`, then run the **Publish Browser Extension** workflow from the Actions tab (choose `both`, `chrome`, or `firefox`).

The workflow needs these repository secrets:

| Secret | Where to get it |
| --- | --- |
| `CWS_EXTENSION_ID` | Chrome Web Store developer dashboard — the extension's ID |
| `CWS_CLIENT_ID` / `CWS_CLIENT_SECRET` / `CWS_REFRESH_TOKEN` | Google Cloud OAuth credentials with the Chrome Web Store API enabled — see the [chrome-webstore-upload guide](https://github.com/fregante/chrome-webstore-upload/blob/main/How%20to%20generate%20Google%20API%20keys.md) |
| `AMO_JWT_ISSUER` / `AMO_JWT_SECRET` | [AMO API credentials](https://addons.mozilla.org/en-US/developers/addon/api/key/) |

Notes:

- The Chrome Web Store API can only update an existing listing. If the listing was removed (e.g. the MV2 deprecation takedown), the first MV3 upload may need to be done manually in the dashboard; CI handles every publish after that.
- The AMO listing ID is pinned in `public/manifest.json` under `browser_specific_settings.gecko.id` and must not change.
- Both stores reject re-uploads of an already-published version — forgetting the version bump fails the workflow with a clear error.
