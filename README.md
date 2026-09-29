# tx3 GitHub Actions

Official GitHub Actions for the [tx3](https://github.com/tx3-lang) toolchain.

## Available Actions

### [`setup`](./setup)

Install the tx3 toolchain in your GitHub Actions workflow.

```yaml
- uses: tx3-lang/actions/setup@v1
```

#### Inputs

| Input          | Description                                      | Default         |
|----------------|--------------------------------------------------|-----------------|
| `channel`      | Toolchain channel (`stable`, `nightly`, `beta`)  | `stable`        |
| `version`      | Specific [toolchain release](https://github.com/tx3-lang/toolchain/releases) tag | latest          |
| `github-token` | GitHub token for API requests                    | `github.token`  |

#### Outputs

| Output         | Description                                   |
|----------------|-----------------------------------------------|
| `tx3-version`  | The installed tx3c version (e.g. `0.25.0`)    |
| `trix-version` | The installed trix version (e.g. `0.28.0`)    |
| `bin-path`     | Path to the installed toolchain binaries      |

The installed channel becomes the default toolchain, so `trix` finds `tx3c`
and the other tools it runs.

#### Examples

**Basic usage (latest stable):**

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: tx3-lang/actions/setup@v1
  - run: tx3c --version
```

**Specific channel:**

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: tx3-lang/actions/setup@v1
    with:
      channel: nightly
```

**Specific version:**

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: tx3-lang/actions/setup@v1
    with:
      version: "sha-3f2296a"
```
