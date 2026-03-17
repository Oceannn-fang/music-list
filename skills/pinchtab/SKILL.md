---
name: Pinchtab Browser Control
description: Use pinchtab CLI to control browser automation - navigate, click, type, screenshot, extract text, and run JavaScript. Use when the user needs to automate browser tasks, scrape web pages, take screenshots, fill forms, or interact with web UI programmatically.
---

# Pinchtab Browser Control

Control browser automation via the pinchtab CLI tool.

## Prerequisites

- pinchtab must be installed globally: `npm install -g pinchtab`
- Server must be running: `pinchtab` (starts on port 9867 by default)

## Quick Start

Start the server:
```bash
pinchtab
```

Then use any command below.

## Core Commands

### Navigation
```bash
pinchtab nav <url>
```
Example: `pinchtab nav https://example.com`

### Page Analysis
```bash
pinchtab snap              # Full accessibility tree
pinchtab snap -i           # Interactive elements only (buttons, links, inputs)
pinchtab snap -c           # Compact format (token-efficient)
pinchtab snap -i -c        # Interactive + compact (recommended)
pinchtab text              # Extract readable text
pinchtab text --raw        # Raw text without formatting
```

### Interactions
```bash
pinchtab click <ref>                    # Click element by ref (e.g., e5)
pinchtab type <ref> <text>              # Type text into element
pinchtab fill <ref|selector> <text>     # Fill input directly
pinchtab press <key>                    # Press key (Enter, Tab, Escape...)
pinchtab hover <ref>                    # Hover over element
pinchtab select <ref> <value>           # Select dropdown option
pinchtab scroll <ref|pixels>            # Scroll to element or by pixels
```

### Screenshots & PDF
```bash
pinchtab ss                          # Screenshot to default filename
pinchtab ss -o screenshot.png        # Screenshot with custom name
pinchtab ss -q 80                    # Quality 0-100 (default: 80)
pinchtab pdf --tab <id> -o page.pdf  # Export tab as PDF
```

### JavaScript Execution
```bash
pinchtab eval "document.title"
pinchtab eval "document.querySelector('h1').innerText"
```

### Tab Management
```bash
pinchtab tabs                # List tabs
pinchtab tabs new <url>      # Open new tab
pinchtab tabs close <id>     # Close tab
```

### Quick Mode (One-shot)
```bash
pinchtab quick <url>         # Navigate + analyze (beginner-friendly)
```

## Workflow

1. **Start server**: `pinchtab`
2. **Navigate**: `pinchtab nav <url>`
3. **Analyze**: `pinchtab snap -i -c` (get interactive elements with refs)
4. **Interact**: `pinchtab click e5`, `pinchtab type e12 "hello"`
5. **Extract**: `pinchtab text` or `pinchtab ss`

## Environment Variables

```bash
PINCHTAB_URL=http://127.0.0.1:9867    # Server URL
PINCHTAB_TOKEN=<token>                # Auth token
BRIDGE_PORT=9867                      # Server port
BRIDGE_HEADLESS=true                  # Run Chrome headless
```

## Tips

- Use `-i -c` flags for snap to get compact, interactive-only view (most token-efficient)
- Element refs (e.g., `e5`, `e12`) come from the accessibility tree snapshot
- For forms, use `fill` for direct input or `type` for simulated typing
- Use `eval` for custom JavaScript when built-in commands don't suffice
