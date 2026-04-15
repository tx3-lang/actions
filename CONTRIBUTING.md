# Contributing

## Development

The `setup` action is a TypeScript/Node.js action. Source lives in `setup/src/`, compiles to `setup/lib/`, and is bundled to `setup/dist/index.js` by `@vercel/ncc`. The bundled `setup/dist/` is **committed** to the repo — CI fails if it's out of date.

```sh
npm ci
npm run build
```

After any change under `setup/src/`, re-run `npm run build` and commit the updated `setup/dist/`.

## Releasing

Releases are cut by pushing a semver tag. A `Release` workflow (`.github/workflows/release.yml`) takes it from there: it rebuilds, verifies `setup/dist/` is current, moves the floating major tag (e.g. `v1`), and publishes a GitHub Release with auto-generated notes.

Consumers pin to the action with:

```yaml
- uses: tx3-lang/actions/setup@v1       # floating major — gets non-breaking updates
- uses: tx3-lang/actions/setup@v1.2.3   # exact version
```

### Cutting a release

1. **Pre-flight on `main`:**
   - `git checkout main && git pull --ff-only`
   - `npm ci && npm run build` — `git diff setup/dist/` must be empty.
   - Bump `version` in `package.json` to match the tag you're about to push. Commit and push.
   - Wait for CI on `main` to go green.

2. **Push the tag:**
   ```sh
   git tag v1.2.3
   git push origin v1.2.3
   ```

3. **Done.** The release workflow will:
   - Rebuild and verify `setup/dist/`.
   - Force-move `v1` to the release commit.
   - Create a GitHub Release for `v1.2.3` with auto-generated notes.

   Watch the run under **Actions → Release**. If it fails, fix the cause, delete the tag (`git push --delete origin v1.2.3 && git tag -d v1.2.3`), and retry.

### Versioning rules

- **Patch / minor** (`v1.2.3` → `v1.2.4` or `v1.3.0`): non-breaking. The `v1` tag moves forward automatically.
- **Major** (`v1.x.y` → `v2.0.0`): breaking change. Push `v2.0.0` — the workflow will create a new `v2` floating tag and leave `v1` frozen at its last `v1.x.y`.
- **Prereleases** (`v1.2.3-beta.1`): not matched by the release workflow's tag filter. If you need them, extend `.github/workflows/release.yml` to handle the prerelease case.

### Prerequisites (one-time)

The release workflow needs permission to push tags and create releases. In **Settings → Actions → General → Workflow permissions**, ensure **"Read and write permissions"** is selected (or rely on the `permissions: contents: write` declared in the workflow, which is honored when the default is not more restrictive).
