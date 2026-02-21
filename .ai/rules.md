# AI Assistant Rules

Before generating or modifying files:
- Read docs/coding-style.md
- Ensure generated content respects line length limits.

## AI USAGE NOTE
This file defines enforceable rules for AI coding assistants working in this
repository. It prioritizes correctness and security over convenience.

## Layering
- The main entry-point (apart from main.ts) is the "App.vue" file.
- All business logic is handled in vanilla typescript "services" in a dedicated
  subfolder.
- Presentation is handled via VueJS components using the Vuetify library.
- Persistence is solely done in the browser's local-storage. There is no remote
  API.

## NON-NEGOTIABLE
- Prefer existing patterns already present in `src/*` over introducing
  new abstractions.
- Always prefer default styles provided by vuetify over defining custom CSS
  rules.
- No VueJS component should ever do any I/O (like fetch calls). All data
  modification should only happen via either incoming properties or outoing
  events.
- All I/O should be handled via services provided via the main "App.vue" file.
