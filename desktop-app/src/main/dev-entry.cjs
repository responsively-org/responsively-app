// Dev-mode bootstrap: registers tsx before loading the TypeScript entry point.
// Node 24 (Electron 40) handles .ts natively via ESM, bypassing CJS hooks.
// Using a .cjs entry ensures tsx's CJS hook intercepts all .ts imports.
require('tsx/cjs');
require('./main.ts');
