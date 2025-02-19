---
template frontend_generator
---

## Introduction

This is a starter template for a modern React project, utilizing a variety of tools like Vite, Chakra UI, Tailwind CSS, and ESLint.

## Installation

To set up the project, clone the repository and install the dependencies:

```shell
git clone https://github.com/SORNISITH/frontend_generator.git
```

```shell
cd frontend_generator
```

```shell
npm install

npm run dev
```

## Dependency

- **vite**: A fast development build tool that focuses on speed and performance.
- **chakra-ui V3**: Chakra UI CLI tool.
- **next-themes**: A library for managing themes (like light/dark mode) in your React
- **axios**: A promise-based HTTP client for making API requests.
- **clsx**: A utility for constructing `className` strings conditionally.\*\*\*\*
- **tailwindcss/vite**: Vite plugin for integrating Tailwind CSS into your project.

<details>
  <summary>Click to expand >>  package.json</summary>
  
  ```json
  {
    "name": "template",
    "private": true,
    "version": "0.0.0",
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "lint": "eslint",
      "preview": "vite preview"
    },
    "dependencies": {
      "@chakra-ui/react": "^3.8.0",
      "@emotion/react": "^11.14.0",
      "@tailwindcss/vite": "^4.0.6",
      "axios": "^1.7.9",
      "clsx": "^2.1.1",
      "eslint-import-resolver-alias": "^1.1.2",
      "next-themes": "^0.4.4",
      "path": "^0.12.7",
      "react": "^19.0.0",
      "react-dom": "^19.0.0",
      "react-icons": "^5.4.0",
      "react-router": "^7.1.5",
      "tailwindcss": "^4.0.6",
      "url": "^0.11.4"
    },
    "devDependencies": {
      "@chakra-ui/cli": "^3.8.0",
      "@eslint/js": "^9.19.0",
      "@types/react": "^19.0.8",
      "@types/react-dom": "^19.0.3",
      "@vitejs/plugin-react-swc": "^3.5.0",
      "eslint": "^9.19.0",
      "eslint-plugin-react": "^7.37.4",
      "eslint-plugin-react-hooks": "^5.0.0",
      "eslint-plugin-react-refresh": "^0.4.18",
      "globals": "^15.14.0",
      "vite": "^6.1.0"
    }
  }
  ```
</details>
<details></details>

## License

This project is licensed under the MIT License - see the LICENSE file for details.
