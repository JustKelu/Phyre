# 🔥 Phyre

A lightweight React framework with SSR, file-based routing, and monorepo support.

> ⚠️ **Beta Release** - This is an early beta. APIs may change. Use in production at your own risk.

## ✨ Features

- 🚀 **Server-Side Rendering** with React Router 7
- 📁 **File-based routing** with dynamic routes `[id]` and layouts
- 🔥 **Hot Module Replacement** via WebSocket
- 🎨 **Tailwind CSS** built-in with PostCSS
- 🌐 **API routes** with file-based system
- 📦 **Monorepo support** out of the box
- 🔒 **Environment variables** validation
- ⚡ **Fast builds** with esbuild

## 🚀 Quick Start
```bash
# Create new app with CLI
npx create-phyre@latest my-app

# Navigate to project
cd my-app

# Start development
npm run dev

# Build for production
npm run build
```

## 📚 Documentation

Full documentation available at: **[phyre.dev](https://justkelu.github.io/phrye-documentation/)**

Quick links:
- [Getting Started](https://phyre.dev/docs/getting-started)
- [Routing](https://phyre.dev/docs/routing)
- [API Routes](https://phyre.dev/docs/api-routes)
- [Configuration](https://phyre.dev/docs/configuration)

## 🛠️ Requirements

- Node.js >= 18.0.0
- npm or yarn

## 📦 Project Structure
```
my-app/
├── app/
│   ├── index.jsx       # Client entry
│   └── styles.css      # Global styles
├── src/
│   ├── client/
│   │   └── routes/     # File-based routes
│   │       ├── index.jsx
│   │       ├── about.jsx
│   │       └── [id].jsx
│   └── server/
│       └── api/        # API routes
│           └── hello.js
├── index.html
├── phyre.config.js
└── package.json
```

## 🐛 Known Issues

- **Windows (Italian)**: Avoid creating projects in `C:\Users\[User]\Documents\`. Use `Desktop` or `C:\Projects\` instead.

## 📝 Changelog

### v0.8.0-beta.2
- ✅ Fixed file names with hyphens (e.g., `user-home.jsx`) now work correctly
- ✅ Complete documentation available

### v0.8.0-beta.1
- 🎉 Initial beta release

## 🤝 Contributing

Contributions are welcome! Please open an issue or PR.

## 📄 License

MIT © Luca Oliva

## 🔗 Links

- [Documentation](https://justkelu.github.io/phrye-documentation/)
- [Linkedin](https://www.linkedin.com/in/luca-oliva-dev/?locale=en-US)
- [GitHub](https://github.com/justkelu/phyre)
- [Issues](https://github.com/justkelu/phyre/issues)
- [NPM](https://www.npmjs.com/package/phyre)