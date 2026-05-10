## Introduction

Ribbon is designed with a singular, precise focus: **to bring the security, stability, and structure of MCP (Model Context Protocol) to your everyday Command Line Interface.**

Modern development workflows are cluttered with complex, repetitive, and potentially dangerous terminal commands.

Our mission is to transform your terminal experience by providing a unified alias command management system. We offer developers a secure abstraction layer to store, manage, and execute complex command macros with absolute confidence.

**Core Value Proposition:**

- **Encapsulation & Safety:** Wrap intricate or sensitive commands into simple, manageable aliases. Ribbon intercepts and validates execution via a built-in _Execution-Guard_, drastically reducing the risk of catastrophic typos (e.g., recursive deletes or unintended network resets).
- **Dynamic Variable Injection:** Break free from the rigidity of static aliases. Ribbon supports dynamic variable interpolation, allowing you to pass runtime arguments safely into your pre-configured macros.
- **Portability & Persistence:** Built on top of centralized data configurations, your entire command library is strictly decoupled from shell-specific RC files (like `.bashrc` or `.zshrc`). Your workflow travels with you universally out of the box.
  
## 🚀 Installation & Setup

Ribbon is powered by the **[Bun](https://bun.sh/)** runtime for maximum execution speed. You must have Bun installed on your system before proceeding.

### 1. Install Bun (Windows)
If you haven't installed Bun yet, open your terminal and run the following command:
```bash
powershell -c "irm bun.sh/install.ps1 | iex"
```
*(For macOS or Linux users, you can install via `curl -fsSL https://bun.sh/install | bash`)*

### 2. Download & Link Ribbon
Ribbon is currently private and not published to the npm registry. To use it, simply clone or download the project from GitHub and link it locally:

```bash
# 1. Clone the repository (or download and extract the ZIP)
git clone <repository_url>

# 2. Navigate into the project folder
cd ribbon

# 3. Create a global symlink
npm link
```
> **Note:** Running `npm link` will globally register the `rib` executable to your system, allowing you to invoke Ribbon natively from any directory.



## Command Reference

Below is the foundational list of commands currently available.

### Available command list

|  command   |  alias  |                    description                    |
| :--------: | :-----: | :-----------------------------------------------: |
| `register` | `regis`, `rgs` | create new command macro into your Ribbon library |
|   `del`    |    -    |             delete macro from library             |
|   `find`   |    -    |                 find a macro                      |
|   `exec`   |  `run`  |               execute saved command               |
|  `create`  |    -    |                  create template                  |
|  `config`  |  `cfg`  |                 configure Ribbon                  |

### Detailed Command Capabilities

---

#### 📌 `register` (alias: `regis`, `rgs`)
*Add a new macro to your Ribbon library.*

**Structure**
```bash
rib regis <key>='<command>' [options]
```

**Options**
| Flag | Description |
| :--- | :--- |
| `-d` | A detailed description of the command |
| `-a` | A short abstract summary |
| `-t` | Command tags (format: `"tag1, tag2..."`) |

**Variable Binding (`<T>`)**
Ribbon supports injecting runtime arguments dynamically using built-in slots:
- **Plain Slot (`<T>`)**: Accepts any value. No type checking is performed, and delimiters must be handled manually.
- **Typed Slot (`<T: type>`)**: Supports strict `string`, `number`, and `boolean` types. `string` types feature auto-encapsulation (no need to manually wrap them in quotes).
- **Default Slot (`<T>(default)`)**: Automatically uses the provided fallback `default` value if no argument is passed during execution.

> **Note:** For Windows users, we highly recommend wrapping commands in single quotes (`'`) to prevent PowerShell from consuming strings prematurely.

**Example**
```bash
rib regis commit='git commit -m "<T>"' -d "commit changes" -a "commit changes" -t "git, commit"
```

---

#### 📌 `delete` (alias: `del`)
*Delete an existing macro from your registry.*

**Structure**
```bash
rib del <key>
```

**Example**
```bash
rib del commit
```

---

#### 📌 `create`
*Scaffold templates for scripts and custom native commands.*

**Structure**
```bash
rib create <value> [options]
```

**Options**
| Flag | Description |
| :--- | :--- |
| `-s` | Generates the template populated with a beginner-friendly showcase |

**Supported Values**
- `script`: Generates a `.script.ts` file to sequence commands via the API-Hub.
- `command`: Generates a `.cmd.ts` file to extend Ribbon's native commands.

**Example**
```bash
rib create script -s
```

---

#### 📌 `find`
*Search comprehensively through your macro library.*

**Structure**
```bash
rib find <value> [options]
```

**Options**
| Flag | Description |
| :--- | :--- |
| `-t` | Specify target (Supported values: `tag`, `cmd`, `desc`, `code`, `all`) |
| `-g` | Scope the search to a specific group |
| `-m` | Output results in minified mode |

**Example**
```bash
rib find commit -t tag
```

---

#### 📌 `exec` (alias: `run`)
*Execute your registered macros or TypeScript scripts.*

**Structure**
```bash
rib exec <key | command> [value...] [options]
```

**Options**
| Flag | Description |
| :--- | :--- |
| `-d` | Direct execute |
| `-s` | Run isolated script |

**Advanced Processing Layers**
- **Direct Execution (`-d`)**: Bypasses the alias registry to run shell commands directly through Ribbon's processor. Dynamic slots are ignored, but the *Execution-Guard* remains active for maximum safety.
- **Run Script (`-s`)**: Bootstraps and executes custom scripts saved in your `usr/scripts/` directory.
- **Execution-Guard**: A secure proxy wall that halts command delivery upon detecting destructive keywords or blacklist patterns. Drastically reduces the risk of disastrous actions.
- **Type-Checker**: Validates injected values dynamically against the `<T: type>` constraints mapped during registration. If an incompatibility is caught (e.g. attempting to pass a string into a `<T: number>` slot), you will be prompted to safely correct or abort.

**Example**
```bash
rib run commit "my commit message"
```

---

#### 📌 `config` (alias: `cfg`)
*Configure Ribbon's behavior and performance settings.*

**Structure**
```bash
rib config [options]
```

**Options**
| Flag | Description |
| :--- | :--- |
| `-l` | Display an interactive UI to modify configurations |
| `-t <key>` | Toggle a specific setting by key instantly |

**Key Setting Values**
- `alwaysRejectExecution`: Forces the Execution-Guard to drop violations immediately without prompting.
- `useShell`: Toggles the execution base between `powershell.exe` and standard `cmd.exe` on Windows.
- `showMacro`: Surfaces terminal highlighting around matched destructive keywords.

**Smart Slot-Filling Logic (`enableSlotFilling`)**
When enabled, Ribbon leverages an optical/logical priority assigning algorithm. 
Instead of blind 1-to-1 parsing, **Plain Slots** and **Typed Slots** are strictly prioritized for argument matching. Any surplus variables or leftovers gracefully overflow into **Default Slots** sequentially. If required values are left completely empty by the user, the engine will intercept execution and interactively prompt you to fill the missing gaps.

**Example**
```bash
rib config -l
```

## Extensibility: Scripts vs. Core Commands

Ribbon offers two distinct pathways for developers to extend its capabilities depending on the complexity and scope of the task.

### 📜 Automating with `Scripts` (`.script.ts`)
Scripts act as powerful workflow automators. They are run via Ribbon's execution engine but do not expose themselves as top-level CLI commands.
- **Positioning:** Process automation, chaining multiple shell commands, and localized task runners.
- **Usage:** Create a script in the `usr/scripts` folder (or scaffold one via `rib create script`). Execute it on demand using `rib exec <name> -s`.
- **Capabilities:** Scripts have full access to Ribbon's core `api-hub` (which includes advanced stream monitoring, standard output scraping, and sequence abort algorithms).

### 🛠️ Extending with `Commands` (`.cmd.ts`)
Commands are first-class citizens. Creating a command file injects entirely new features directly into the Ribbon CLI namespace.
- **Positioning:** Deep system integration, new functionality, and building complex tooling logic.
- **Usage:** Save command definitions to `commands/custom/` (or scaffold one via `rib create command`). Once saved, Ribbon's dynamic loader will automatically register it as a native command. You can trigger it natively via `rib <your-command-name>`.
- **Capabilities:** Direct access to Commander.js arguments/options routing and deep Ribbon architectural layers. Ideal for writing complex tools similar to `register` or `config`.

---

## Essential Usage Notes & Best Practices

To maintain the optimal Ribbon experience, please keep the following structural rules in mind:

1. **Sequential Tag Resolution**
   When invoking macros equipped with multiple `<T>` placeholders, your inputs provided via the `-T` flag will be mapped sequentially from left to right. Ensure the order of your arguments strictly mirrors the logical sequence designed in your registry.

2. **The Execution-Guard (Safety Net)**
   Ribbon is built to protect the application environment. If your registered macro contains keywords known for high-risk operations (e.g., `rm -rf`, `mkfs`, system registry mutations), Ribbon will automatically intercept the execution and trigger a high-priority warning. Please carefully verify the target context when the engine requests your confirmation.

3. **Data Integrity**
   Ribbon maintains its internal macro schema rigorously. While configuration files are stored locally and transparently via standard OS paths, we strongly advise using the `register` and `del` CLI commands rather than manually editing the underlying JSON tree to prevent schema hydration failures.
