# Semantic Release Monorepo

This project is a **monorepo** that uses [Semantic Release](https://semantic-release.gitbook.io/) to automate versioning and Docker image publishing for multiple plugins. Each plugin is independently versioned and released based on conventional commit messages.

## 📁 Project Structure

```
semantic/
├── plugins/              # Plugin directories (each is an independent module)
│   ├── harel/           # Plugin: harel
│   ├── lagziel/         # Plugin: lagziel
│   └── netanel/         # Plugin: netanel
├── .github/
│   └── workflows/
│       ├── release.yml  # Automated release workflow
│       └── lint.yml     # Commit message validation for PRs
├── commitlint.config.js # Commit message validation rules
├── release.config.js    # Semantic-release configuration
├── manager.mjs          # Release manager for monorepo
└── package.json         # Project dependencies
```

## 🚀 How It Works

### Automatic Docker Image Building

When you push commits to the `main` branch that modify files in the `plugins/` directory:

1. **Commit Validation**: The system validates that your commit message follows the [Conventional Commits](https://www.conventionalcommits.org/) format
2. **Change Detection**: The `manager.mjs` script detects which plugin(s) were modified
3. **Version Bump**: Semantic-release automatically determines the next version based on the commit type
4. **Docker Build & Push**: A Docker image is built and pushed to Docker Hub with the new version tag
5. **Git Tag**: A git tag is created (e.g., `harel-v1.2.3`)
6. **Changelog**: The `CHANGELOG.md` file in the plugin directory is updated

## 📝 Commit Message Format

All commits **must** follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Requirements

- **Type**: Must be one of: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
- **Scope**: **Required** and must match a plugin directory name in `plugins/`
- **Description**: A short summary of the change

### Valid Commit Types

| Type | Description | Version Bump |
|------|-------------|--------------|
| `feat` | A new feature | Minor (1.x.0) |
| `fix` | A bug fix | Patch (1.0.x) |
| `docs` | Documentation changes | Patch (1.0.x) |
| `style` | Code style changes | Patch (1.0.x) |
| `refactor` | Code refactoring | Patch (1.0.x) |
| `perf` | Performance improvements | Patch (1.0.x) |
| `test` | Adding or updating tests | Patch (1.0.x) |
| `chore` | Maintenance tasks | Patch (1.0.x) |

> **Note**: This project is configured so that **any commit type** with a valid scope triggers at least a patch release. Only `feat` commits trigger a minor version bump. To trigger a major version bump, include `BREAKING CHANGE:` in the commit body.

### Available Scopes (Plugin Names)

The scope must match one of the plugin directories:
- `harel`
- `lagziel`
- `netanel`

## ✅ Valid Commit Examples

### Feature Addition (Minor Version Bump)
```bash
git commit -m "feat(harel): add new authentication feature"
```
This triggers:
- Version bump from `1.2.3` → `1.3.0`
- Docker image: `username/harel:1.3.0`

### Bug Fix (Patch Version Bump)
```bash
git commit -m "fix(netanel): resolve connection timeout issue"
```
This triggers:
- Version bump from `1.2.3` → `1.2.4`
- Docker image: `username/netanel:1.2.4`

### Documentation Update (Patch Version Bump)
```bash
git commit -m "docs(lagziel): update API documentation"
```
This triggers:
- Version bump from `1.0.0` → `1.0.1`
- Docker image: `username/lagziel:1.0.1`

### Refactoring (Patch Version Bump)
```bash
git commit -m "refactor(harel): improve error handling logic"
```

## ❌ Invalid Commit Examples

```bash
# ❌ Missing scope
git commit -m "feat: add new feature"

# ❌ Invalid scope (doesn't match plugin directory)
git commit -m "feat(invalid-plugin): add feature"

# ❌ Invalid type
git commit -m "update(harel): update code"

# ❌ Not following conventional format
git commit -m "Updated some files in harel"
```

## 🔄 Release Workflow

The release process is fully automated via GitHub Actions:

### 1. Push to Main Branch
```bash
git add plugins/harel/Dockerfile
git commit -m "feat(harel): update base image to alpine"
git push origin main
```

### 2. Automated Steps (GitHub Actions)

**Validation Job** (`validate-commits`):
- Fetches commit history
- Validates all commit messages
- Ensures scopes match plugin directories
- Fails if any commit is invalid

**Release Job** (`release`):
- Runs only if validation passes
- Installs dependencies
- Logs into Docker Hub
- Executes `manager.mjs` which:
  - Detects changed plugins via `git diff`
  - For each changed plugin:
    - Runs semantic-release
    - Bumps version in `package.json`
    - Builds Docker image with new version tag
    - Pushes image to Docker Hub
    - Updates `CHANGELOG.md`
    - Creates git tag (e.g., `harel-v1.3.0`)
    - Commits changes back to repository

### 3. Result
- New Docker image available: `dockerhub-username/harel:1.3.0`
- Git tag created: `harel-v1.3.0`
- Updated `CHANGELOG.md` in plugin directory
- Updated `package.json` with new version

## 🏷️ Versioning Strategy

This project follows [Semantic Versioning](https://semver.org/) (SemVer):

```
MAJOR.MINOR.PATCH
  │     │     │
  │     │     └─ Bug fixes, docs, refactors (fix, docs, refactor, etc.)
  │     └─────── New features (feat)
  └───────────── Breaking changes (BREAKING CHANGE in commit body)
```

### Breaking Changes

To trigger a **major** version bump, include `BREAKING CHANGE:` in the commit body:

```bash
git commit -m "feat(harel): redesign API

BREAKING CHANGE: The authentication endpoint has been completely redesigned.
Old clients will need to update their integration."
```

This bumps version from `1.2.3` → `2.0.0`

## 🛠️ Development Workflow

### Adding a New Plugin

1. Create a new directory under `plugins/`:
   ```bash
   mkdir plugins/mynewplugin
   ```

2. Add a `Dockerfile`:
   ```dockerfile
   FROM busybox:latest
   ENTRYPOINT ["/app/plugin.sh"]
   ```

3. Commit with the new plugin scope:
   ```bash
   git add plugins/mynewplugin
   git commit -m "feat(mynewplugin): initial plugin setup"
   git push origin main
   ```

The system will automatically:
- Recognize `mynewplugin` as a valid scope
- Create initial version `1.0.0`
- Build and push Docker image

### Working on Pull Requests

For pull requests, commit messages are validated by the `lint.yml` workflow:

```bash
# On your feature branch
git commit -m "feat(harel): add caching mechanism"
git push origin feature/add-caching
```

The PR will automatically run `commitlint` to validate all commits.

## 📋 GitHub Actions Workflows

### `release.yml` (Main Branch Only)
Triggers on: Push to `main` branch with changes in `plugins/**`

Jobs:
1. **validate-commits**: Validates all commit messages
2. **release**: Builds and publishes Docker images

### `lint.yml` (Pull Requests)
Triggers on: Pull request creation/update

Jobs:
1. **commitlint**: Validates all commits in the PR

## 🔐 Required Secrets

Configure these secrets in your GitHub repository settings:

| Secret | Description |
|--------|-------------|
| `DOCKER_REG_USERNAME` | Docker Hub username |
| `DOCKER_REG_PASSWORD` | Docker Hub password or access token |
| `GITHUB_TOKEN` | Automatically provided by GitHub Actions |

## 📚 Additional Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Semantic Release Documentation](https://semantic-release.gitbook.io/)
- [Commitlint](https://commitlint.js.org/)

## 💡 Tips

- **Always specify a scope**: The scope is mandatory and must match a plugin directory
- **Use meaningful descriptions**: Write clear, concise commit messages
- **One plugin per commit**: Keep changes focused on a single plugin for cleaner releases
- **Check your commits locally**: Run `npx commitlint --from HEAD~1` before pushing
- **Review the CHANGELOG**: Each plugin maintains its own changelog in its directory

## 🆘 Troubleshooting

### "Commit message validation failed"
- Check that your commit follows the format: `type(scope): description`
- Ensure the scope matches a plugin directory name exactly
- Verify the type is one of the valid types listed above

### "Docker build failed"
- Ensure the `Dockerfile` in your plugin directory is valid
- Check Docker Hub credentials are configured correctly
- Review the GitHub Actions logs for detailed error messages

### "No release triggered"
- Ensure changes are in the `plugins/` directory
- Verify commits are being pushed to the `main` branch
- Check that commit messages follow conventional format

---

**Questions?** Open an issue in the repository.
