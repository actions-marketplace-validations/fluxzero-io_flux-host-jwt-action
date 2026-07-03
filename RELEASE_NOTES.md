This release fixes GitHub Marketplace validation by shortening the Action metadata description.

This release updates the action for GitHub's Node.js 20 deprecation.

- Runs the action on GitHub's `node24` JavaScript action runtime.
- Verifies compatibility on Node.js 20, 24, and 26.
- Uses Node.js 26 for the bundled `dist` build in CI.
- Updates Actions toolkit, JWT, TypeScript, ESLint, and related dependencies.
- Updates workflows to `actions/checkout@v6` and `actions/setup-node@v6`.
- Documents runtime defaults, Node.js 26 compatibility, and the temporary Node.js 20 override behavior.
