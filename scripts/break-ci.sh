#!/bin/bash
# =============================================================================
# break-ci.sh — Intentionally introduce a failure to demo self-healing
# =============================================================================
# Usage: ./scripts/break-ci.sh [test|lint|dep]
#
#   test  — Break a test (default)
#   lint  — Introduce a lint error
#   dep   — Break a dependency
# =============================================================================

set -e

FAILURE_TYPE="${1:-test}"

case "$FAILURE_TYPE" in
  test)
    echo "💥 Breaking the add() function to cause test failure..."
    sed -i 's/return a + b;/return a - b; \/\/ BROKEN BY break-ci.sh/' src/calculator.js
    git add src/calculator.js
    git commit -m "test: intentionally break add() to demo self-healing"
    echo "✅ Done. Push to trigger CI failure → self-healing."
    echo "   Run: git push"
    ;;

  lint)
    echo "💥 Adding lint errors..."
    echo "
// BROKEN BY break-ci.sh
var unused_variable = 'this breaks lint'
var another = 'missing semicolons everywhere'" >> src/calculator.js
    git add src/calculator.js
    git commit -m "test: intentionally add lint errors to demo self-healing"
    echo "✅ Done. Push to trigger CI failure → self-healing."
    echo "   Run: git push"
    ;;

  dep)
    echo "💥 Adding a non-existent dependency..."
    # Add a fake package that doesn't exist on npm
    npx -y json -I -f package.json -e 'this.dependencies["this-package-does-not-exist-xyz-999"]="^1.0.0"'  2>/dev/null || \
      sed -i 's/"express":/"this-package-does-not-exist-xyz-999": "^1.0.0",\n    "express":/' package.json
    git add package.json
    git commit -m "test: add broken dependency to demo self-healing"
    echo "✅ Done. Push to trigger CI failure → self-healing."
    echo "   Run: git push"
    ;;

  *)
    echo "Usage: $0 [test|lint|dep]"
    echo "  test  — Break a unit test (default)"
    echo "  lint  — Introduce lint errors"
    echo "  dep   — Add a non-existent dependency"
    exit 1
    ;;
esac
