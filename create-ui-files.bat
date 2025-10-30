@echo off
cd c:\aom_NewXPS\MDC_2025\CAI2300C\Windsurf_Projects\golf-tracker

echo Creating UI component files...

type nul > src\components\ui\button.tsx
type nul > src\components\ui\card.tsx
type nul > src\components\ui\input.tsx
type nul > src\components\ui\label.tsx
type nul > src\components\ui\dropdown-menu.tsx
type nul > "src\app\(dashboard)\rounds\new\page.tsx"
type nul > "src\lib\store\index.ts"

echo Files created successfully!
pause