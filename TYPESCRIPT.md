# TypeScript Type Checking

This project uses TypeScript type definitions from `@enonic-types` version 8.0.0-A2 to provide type checking for Enonic XP library usage.

## Setup

Install npm dependencies:

```bash
npm install
```

## Running Type Check

To run TypeScript type checking:

```bash
npm run typecheck
```

## Configuration

- `tsconfig.json` - TypeScript configuration file
- `package.json` - npm dependencies including all @enonic-types packages
- `src/main/resources/types/` - Custom type declarations for third-party libraries

## Gradle Integration

The build includes Gradle tasks for TypeScript type checking:

- `npmInstall` - Install npm dependencies
- `typecheck` - Run TypeScript type checking
- `check` - Includes typecheck task

To run via Gradle:

```bash
./gradlew typecheck
```

## Type Definitions

All Enonic XP library imports are configured to use TypeScript types from `@enonic-types`:

- `/lib/xp/auth` → `@enonic-types/lib-auth`
- `/lib/xp/content` → `@enonic-types/lib-content`
- `/lib/xp/portal` → `@enonic-types/lib-portal`
- And all other XP libraries...

Third-party library types are defined in `src/main/resources/types/`:
- `/lib/thymeleaf`
- `/lib/http-client`
- `/lib/mustache`
- `/lib/text-encoding`
