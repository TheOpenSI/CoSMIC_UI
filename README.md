<h1 align="center">📁 Directory Hierarchy</h1>

```md
CoSMIC_UI/
├── docker/                     # Containerization resources and orchestration files
│   └── dockerfiles/            # Dockerfile for each service defined in Docker Compose file
├── public/                     # Static assets served directly by Vite
├── src/                        # Application source code
│   ├── api/                    # API integration layer and fetch utilities
│   ├── assets/                 # Static assets imported by source files
│   ├── components/             # Reusable UI components
│   │   └── sidebar/            # Sidebar-specific components
│   ├── layout/                 # Top-level layout components
│   ├── lib/                    # Shared utility functions and helpers
│   ├── pages/                  # Route-level page components
│   │   └── admin_sub_pages/    # Sub-pages rendered within the Admin panel
│   ├── stores/                 # Global state management via Zustand
│   ├── types/                  # Custom type definitions to pre-validate payload data to API endpoints
│   ├── App.tsx                 # Root component with routing configuration
│   ├── index.css               # Global styles
│   └── main.tsx                # Application entry point
├── .dockerignore               # Files excluded from Docker builds
├── .env_example                # Example environment variable file
├── .gitattributes              # Git configuration for path attributes
├── .gitignore                  # Files excluded from version control
├── compose.yaml                # Docker Compose specification for service orchestration
├── eslint.config.js            # ESLint configuration
├── index.html                  # HTML entry point for Vite
├── package.json                # Project metadata and dependency definitions
├── README.md                   # This's what you're seeing right now
├── tsconfig.app.json           # TypeScript config for application source
├── tsconfig.json               # Root TypeScript config (references app + node)
├── tsconfig.node.json          # TypeScript config for Vite/Node tooling
├── vite.config.ts              # Vite build configuration
└── yarn.lock                   # Pinned dependency lockfile via `yarn`
```

---
# Quick Start

Before setting up, ensure you have the appropriate tools installed depending on your chosen setup method. This guide supports:
- Native setup (running services directly on your machine)
- Docker setup (running services in isolated containers)


| **Tool** | **Docker Setup**      | **Native Setup**      |
| -------- | --------------------- | --------------------- |
| Docker   | ✅ Mandatory          | ❌ Not required       |
| Node.js  | ❌ Not required       | ✅ Mandatory (v24.15+)|
| yarn     | ❌ Not required       | ✅ Mandatory (latest) |


Then, start by cloning the repository using your preferred method:

```bash
# Linux/MacOS
git clone https://github.com/TheOpenSI/CoSMIC_UI.git    # Using HTTPS (recommended for most users)
git clone git@github.com:TheOpenSI/CoSMIC_UI.git        # Using SSH (recommended if you've SSH keys configured)
```
```ps1
# Windows
git clone https://github.com/TheOpenSI/CoSMIC_UI.git    # Using HTTPS (recommended for most users)
git clone git@github.com:TheOpenSI/CoSMIC_UI.git        # Using SSH (recommended if you've SSH keys configured)
```

Once cloned, navigate to the project root directory:

```bash
# Linux/MacOS
cd CoSMIC_UI/
```
```ps1
# Windows
Set-Location CoSMIC_UI\
```

# Understanding Configuration Setup

The frontend connects to 2 backend services ([COSMIC-DB](https://github.com/TheOpenSI/COSMIC-DB/tree/dev) & [CoSMIC](https://github.com/TheOpenSI/CoSMIC/tree/Development)) via environment variables. Understanding this structure will help you prepare the environment correctly.

## Docker Configuration

Create a `.env` file in the project root directory by copying the example file:

```bash
# Linux/MacOS
cp .env_example .env
```
```ps1
# Windows
Copy-Item -Path .\.env_example -Destination .\.env
```

Then, edit `.env` and set the URLs to match your running backend services. For example:

```bash
# Linux/MacOS
VITE_API_BASE_URL="http://localhost:3000"     # For CoSMIC
VITE_API_DATABASE_URL="http://localhost:8000" # For COSMIC-DB
```
```ps1
# Windows
VITE_API_BASE_URL="http://localhost:3000"     # For CoSMIC
VITE_API_DATABASE_URL="http://localhost:8000" # For COSMIC-DB
```

## Native Configuration

> [!TIP]
> The `.env` file approach is recommended as it keeps your configuration
> organised and prevents accidentally committing secrets to version control.
> Make sure to add `.env` to your `.gitignore` file.

### **Option 1: Create a `.env` file in the project root directory**

```bash
# Linux/MacOS
cp .env_example .env
```
```ps1
# Windows
Copy-Item -Path .\.env_example -Destination .\.env
```

Then, edit `.env` and set the URLs to match your running backend services. For example:

```bash
# Linux/MacOS
VITE_API_BASE_URL="http://localhost:3000"     # For CoSMIC
VITE_API_DATABASE_URL="http://localhost:8000" # For COSMIC-DB
```
```ps1
# Windows
VITE_API_BASE_URL="http://localhost:3000"     # For CoSMIC
VITE_API_DATABASE_URL="http://localhost:8000" # For COSMIC-DB
```

### **Option 2: Set environment variables directly in your shell**

Alternatively, export variables directly before running the application:

```bash
# Linux/MacOS
export VITE_API_BASE_URL="http://localhost:3000"     # For CoSMIC
export VITE_API_DATABASE_URL="http://localhost:8000" # For COSMIC-DB
```
```ps1
# Windows
$env:VITE_API_BASE_URL="http://localhost:3000"     # For CoSMIC
$env:VITE_API_DATABASE_URL="http://localhost:8000" # For COSMIC-DB
```

---
# Setup & Execution

> [!TIP]
> Docker provides an isolated environment where the frontend runs in a container.
> This approach is recommended if you want a consistent environment without
> installing Node.js dependencies directly on your machine.

## Docker Setup

> [!NOTE]
> It's possible to run Docker in rootless mode on Linux. However, the way to set
> it up differs across Linux distros. Please refer to [this](https://docs.docker.com/engine/install) and [this](https://docs.docker.com/engine/security/rootless/)
> (both sourced from Docker documentation) to choose the one that fits your
> current Linux distro.

Before you begin, ensure you have **Docker** & **Docker Compose** installed:

1. [**Docker**](https://docs.docker.com/get-docker/)
2. [**Docker Compose**](https://docs.docker.com/compose/install/)

### **1. Starting Docker Services**

From the project root directory, ensure you've completed  the steps in the [Docker Configuration](#docker-configuration) section above. Then start all the service using the Docker Compose file:

```bash
# Linux/MacOS
sudo docker compose up --build -d   # Refer to NOTE above if running in rootless mode
```
```ps1
# Windows
docker compose up --build -d        # Docker runs through a lightweight Linux VM on Windows, so it's rootless by default
```

### **2. Verifying Docker Services**

Once the container is running, verify the frontend is working:

1. **React**: [localhost:5173](http://localhost:5173)

## Native Setup

Before you begin, ensure you have `Node.js (v24.15+)` and `yarn` installed on your system:

```bash
# Linux/MacOS
node --version
yarn --version
```
```ps1
# Windows
node --version
yarn --version
```

### **1. Installing Dependencies**

From the project root directory, install the project's dependencies using `yarn` package manager:

```bash
# Linux/MacOS
yarn install
```
```ps1
# Windows
yarn install
```

### **2. Starting Frontend Server**

After dependencies are installed, ensure you've completed the steps from the [Native Configuration](#native-configuration) section above. Then start the Vite development server:

```bash
# Linux/MacOS
yarn dev
```
```ps1
# Windows
yarn dev
```

### **3. Verifying Native Setup**

You can now verify the frontend is running correctly:

1. **React**: [localhost:5173](http://localhost:5173)
