<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Game architecture
- Keep all game rules and rover physics in `src/game/simulation.ts`, with the external store bridging rendering and HUD; this makes science and survival rules independently testable.
- Generate all scene geometry and textures procedurally, and resolve renderer colors from global semantic scene tokens; this preserves the procedural-only constraint and coherent theming.
- Mount Solar Watch at the client-only index route; WebGL and procedural canvas textures require browser APIs.
- Persist versioned local mission saves through guarded browser effects and events; local saves are explicitly specified and must degrade to in-memory play.
