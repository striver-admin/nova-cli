# nova-cli

Project scaffolding CLI for Vue and React.

## Usage

```bash
# Create a new project
nova create my-app

# Specify template
nova create my-app --template vue3
nova create my-app --template react18

# Specify package manager
nova create my-app --template vue3 --package-manager pnpm

# Skip install or git init
nova create my-app --template vue3 --skip-install --skip-git

# List templates
nova list

# Show template info
nova info vue3
```

## Templates

| Template | Description |
|----------|-------------|
| vue3 | Vue 3 + TypeScript with Vite, Pinia, Vue Router |
| react18 | React 18 + TypeScript with Vite, Zustand, React Router |

## Development

```bash
pnpm install
pnpm -r build
cd packages/cli && npm link
```

## Adding New Templates

1. Create `packages/template-<name>/` with project files
2. Add entry to `packages/cli/src/templates/registry.ts`
3. Commit and push
