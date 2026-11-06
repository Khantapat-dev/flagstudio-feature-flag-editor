# 🚩 FlagStudio — Feature Flag Editor

A responsive web application for creating, configuring, and managing feature flags through an intuitive interface.

Built as part of a **Frontend Developer Coding Challenge**, with a focus on component architecture, form state management, schema validation, and user experience.

## ✨ Features

- **Multiple Feature Flags** — Create and manage multiple feature flags within a single interface.
- **Flag Configuration** — Configure flag names, keys, descriptions, and other general settings.
- **Dynamic Variations** — Add, edit, remove, and reorder variations with configurable value types.
- **Targeting Rules** — Build conditional targeting rules with nested AND/OR logic.
- **Live JSON Preview** — Preview the generated feature flag configuration in real time using Monaco Editor.
- **Form Validation** — Validate form inputs using Zod and TanStack React Form.
- **Responsive Design** — Optimized layouts for different screen sizes.
- **Light & Dark Mode** — Theme support for the application interface.
- **Draft & Reset Actions** — Save draft configurations, reset form data, and copy generated JSON.

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19, TanStack Start |
| Routing | TanStack Router |
| Form Management | TanStack React Form |
| Validation | Zod |
| JSON Preview | Monaco Editor |
| Styling | Tailwind CSS v4, shadcn/ui |
| Build Tool | Vite |
| Testing | Vitest |
| Language | TypeScript |

## 🚀 Getting Started

### Prerequisites

- Node.js
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/Khantapat-dev/flagstudio-feature-flag-editor.git
```

Navigate to the project directory:

```bash
cd flagstudio-feature-flag-editor
```

Install dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Open the application at:

http://localhost:3000

### Production Build

```bash
npm run build
```

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests with Vitest |
| `npm run format` | Format code with Prettier |
| `npm run check` | Run formatting and lint fixes |

## 🧩 Feature Flag Configuration

The editor organizes feature flag settings into four main tabs:

### 1. General
Configure the basic information and settings of each feature flag.

### 2. Variations
Manage variation values through a dynamic interface with support for adding, removing, and reordering entries.

### 3. Targeting
Define targeting conditions using rules and nested logical groups.

### 4. Metadata
Manage additional configuration details associated with a feature flag.

The JSON preview updates as the configuration changes, allowing users to inspect the generated output.

## 🏗 Architecture

The application uses a component-based structure to separate form logic, validation, UI components, and JSON transformation utilities.

Key architectural considerations include:

- Reusable React components
- Type-safe configuration models
- Centralized Zod validation schemas
- Dynamic form state management
- Recursive targeting rule structures
- Separation of UI and data transformation logic

## 📸 Screenshots

Screenshots of the application can be added here to demonstrate the editor interface, variations, targeting rules, and JSON preview.

## ✅ Verification

The project has been verified using:

```bash
npm run lint
npm run build
```

Both commands completed successfully during development.

## 📌 Project Background

This project was developed as a solution to a Frontend Developer Coding Challenge.

The initial project scaffold and challenge requirements were provided by **Swift Dynamics**. The Feature Flag Editor implementation and UI customizations were developed as part of the challenge.

## 👨‍💻 Developer

**Khantapat**

GitHub: https://github.com/Khantapat-dev

---

*Built with React, TanStack, TypeScript, and Tailwind CSS.*