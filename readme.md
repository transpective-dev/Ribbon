Ribbon is an alias tool.

What can we provide but other can't ?

- intuitive macro : in here, you can see information you have defined for your alias. (e.g. description about command set, created time )

- safe command execution : you don't have to worry about AI will run danger command anymore!. our execution-guard will prevent you from danger in anytime!.

---

### How to Use

Here are the primary commands you will use:

| Command  | Description                                 |
| :------: | :-----------------------------------------: |
| register | Create a new macro in your Ribbon library   |
|   del    | Delete a macro from the library             |
|   find   | Search for a macro                          |
|   run    | Execute a saved command                     |

For a detailed command reference, check the [Full Documentation](full.md).

---

### Before You Start

1. **Built for Customization**: Ribbon uses raw TypeScript instead of compiled JavaScript. You can use `npm link` to add Ribbon to your global path while keeping the ability to tweak the source code.
2. **Runtime Requirements**: Ribbon requires either `bun` or `npx` (Node.js). Please verify your installation:

```bash
bun --version
# or
npx --version
```

**What's the difference?**
- **Bun**: Our recommendation. Extremely fast startup and native TypeScript support.
- **npx**: Slower than Bun, but widely available on most machines via Node.js.

---

### Installation Guide

Use the following templates to clone and set up Ribbon on your machine:

#### Windows Users
```powershell
# Install Bun (optional but recommended)
powershell -c "irm bun.sh/install.ps1 | iex";

# Setup Ribbon
git clone https://github.com/transpective-dev/Ribbon;
cd Ribbon;
npm link;
```

#### Linux & macOS Users
```bash
# Install Bun (optional but recommended)
curl -fsSL https://bun.sh/install | bash;

# Setup Ribbon
git clone https://github.com/transpective-dev/Ribbon;
cd Ribbon;
npm link;
```
