# @dsh-skins/adapter-dsh-web

Reference adapter for the official DSH Web UI and desktop clients that embed it. It maps portable semantic tokens to the current `--dsw-*` variables, exposes every standard asset as a canonical CSS variable, and renders the optional character-state overlay without evaluating skin code.

Other clients implement the same protocol capabilities with their own renderer instead of depending on this package.
