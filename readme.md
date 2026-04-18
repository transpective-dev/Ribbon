# Ribbon CLI

## Introduction

Ribbon is designed with a singular, precise focus: **to bring the security, stability, and structure of MCP (Model Context Protocol) to your everyday Command Line Interface.**

Modern development workflows are cluttered with complex, repetitive, and potentially dangerous terminal commands. 

Our mission is to transform your terminal experience by providing a unified alias command management system. We offer developers a secure abstraction layer to store, manage, and execute complex command macros with absolute confidence.

**Core Value Proposition:**
- **Encapsulation & Safety:** Wrap intricate or sensitive commands into simple, manageable aliases. Ribbon intercepts and validates execution via a built-in *Execution-Guard*, drastically reducing the risk of catastrophic typos (e.g., recursive deletes or unintended network resets).
- **Dynamic Variable Injection:** Break free from the rigidity of static aliases. Ribbon supports dynamic variable interpolation, allowing you to pass runtime arguments safely into your pre-configured macros.
- **Portability & Persistence:** Built on top of centralized data configurations, your entire command library is strictly decoupled from shell-specific RC files (like `.bashrc` or `.zshrc`). Your workflow travels with you universally out of the box.

---

## Command Reference

Below is the foundational list of commands currently available. 

### `register` (alias: `add`)
Register a new command macro into your Ribbon library.
- **`alia="<command>"`**: The actual macro structure. (Usage: `rib register myAlias="git add . && git commit -m '<T: string>'"` )
- **`-d, --description <text>`**: Provide a detailed explanation of what the command does.
- **`-a, --abstract <text>`**: A short human-readable identifier.
- **`-t, --tags <text...>`**: Categorical tags for searching and filtering.

### `exec` (alias: `run`)
Safely execute a previously registered command.
- **`<alias>`**: The registered name of the macro you wish to trigger.
- **`-T <text...>`**: The dynamic values to be injected into the `<T: string>` slots of your macro, mapped sequentially.

### `ls` (alias: `list`)
Render a beautifully formatted table of all currently registered commands.
- **`-f, --full`**: Display the complete dictionary of commands.

### `src` (alias: `search`)
Search your Ribbon library to find exact macros quickly.
- **`<keyword>`**: The term to match against command names, descriptions, or tags.
- **`-g, --group <name>`**: Restrict search results to a specific namespace.

### `del` (alias: `remove`)
Delete a command from your library permanently.
- **`<alias>`**: The target alias to be removed.

### `import`
Merge external command configurations into your system.
- **`-P, --path <path>`**: The absolute or relative path to the configuration file you intend to integrate.

---

## Essential Usage Notes & Best Practices

To maintain the optimal Ribbon experience, please keep the following structural rules in mind:

1. **Sequential Tag Resolution**
   When invoking macros equipped with multiple `<T>` placeholders, your inputs provided via the `-T` flag will be mapped sequentially from left to right. Ensure the order of your arguments strictly mirrors the logical sequence designed in your registry.

2. **The Execution-Guard (Safety Net)**
   Ribbon is built to protect the application environment. If your registered macro contains keywords known for high-risk operations (e.g., `rm -rf`, `mkfs`, system registry mutations), Ribbon will automatically intercept the execution and trigger a high-priority warning. Please carefully verify the target context when the engine requests your confirmation.

3. **Data Integrity**
   Ribbon maintains its internal macro schema rigorously. While configuration files are stored locally and transparently via standard OS paths, we strongly advise using the `register` and `del` CLI commands rather than manually editing the underlying JSON tree to prevent schema hydration failures.
