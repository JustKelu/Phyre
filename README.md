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
# Install Phyre globally
npm install -g phyre@beta

# Navigate to your project directory
cd my-app

# Initialize package.json and add phyre as dependency
npm init -y
npm install phyre@beta

# Add scripts to package.json:
# "scripts": {
#   "dev": "phyre dev",
#   "build": "phyre build"
# }

# Start development
npm run dev

# Build for production
npm run build
```

## 📚 Documentation

Coming soon.

## 🛠️ Requirements

- Node.js >= 18.0.0
- npm or yarn

## 🐛 Known Issues

- **Windows**: Avoid creating projects in `C:\Users\[User]\Documenti\` or any protected folder.

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

## 🤝 Contributing

Contributions are welcome! Please open an issue or PR.

## 📄 License

MIT © Luca Oliva

## 🔗 Links

- [GitHub](https://github.com/justkelu/phyre)
- [Issues](https://github.com/justkelu/phyre/issues)