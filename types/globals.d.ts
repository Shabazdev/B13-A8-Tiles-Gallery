// Type declarations for side-effect CSS imports (e.g. `import './globals.css'`).
// Next.js only declares `*.module.css` etc. in its `global.d.ts`, which leaves
// plain `.css` side-effect imports unresolved once
// `noUncheckedSideEffectImports` is enabled.
// See: https://www.typescriptlang.org/tsconfig/#noUncheckedSideEffectImports
declare module '*.css';
