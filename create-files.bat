@echo off
cd c:\aom_NewXPS\MDC_2025\CAI2300C\Windsurf_Projects\golfjam

echo Creating files...

type nul > src\lib\utils.ts
type nul > src\lib\hooks\use-local-storage.ts
type nul > src\lib\store\index.ts
type nul > src\components\theme-provider.tsx
type nul > src\components\layout\site-header.tsx
type nul > src\components\layout\site-footer.tsx
type nul > src\components\ui\button.tsx
type nul > src\components\ui\card.tsx
type nul > src\components\ui\input.tsx
type nul > src\components\ui\label.tsx
type nul > src\components\ui\dropdown-menu.tsx
type nul > "src\app\(dashboard)\rounds\page.tsx"
type nul > "src\app\(dashboard)\rounds\new\page.tsx"
type nul > "src\app\(dashboard)\practice\page.tsx"
type nul > "src\app\(dashboard)\clubs\page.tsx"
type nul > "src\app\(dashboard)\stats\page.tsx"

echo Files created successfully!
pause