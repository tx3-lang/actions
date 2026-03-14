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
| `version`      | Specific toolchain release tag                   | latest          |
| `github-token` | GitHub token for API requests                    | `github.token`  |

#### Outputs

| Output        | Description                              |
|---------------|------------------------------------------|
| `tx3-version` | The installed tx3c compiler version      |
| `bin-path`    | Path to the installed toolchain binaries |

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
      version: "2025.03.01"
```
