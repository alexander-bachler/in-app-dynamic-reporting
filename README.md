# In-App Dynamic Reporting

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

A dynamic reporting tool for the LineMetrics platform, providing interactive data visualization and analysis capabilities through a React-based monorepo architecture.

## 🚀 Features

- **Monorepo Architecture**: Organized with npm workspaces for efficient code sharing
- **Account-Specific Reports**: Customizable reports for different LineMetrics accounts
- **Global Reports**: Cross-account reporting capabilities (CO2, Energy, etc.)
- **Shared API Client**: OAuth 2.0 authentication with LRU caching
- **Docker Support**: Containerized deployment with nginx
- **CI/CD Ready**: GitLab CI/CD pipeline integration

## 📁 Project Structure

```
apps/
├── shared/
│   └── api-client/          # Shared TypeScript API client (@project/api-client)
├── accounts/
│   └── {accountId}/
│       └── {report-name}/   # Account-specific reports
├── global/
│   ├── co2/                 # Global CO2 reporting
│   ├── energy/              # Global energy reporting
│   ├── map/                 # Interactive map reports
│   └── ...                  # Other global reports
└── examples/
    └── example/             # Template for new reports
```

## 🛠️ Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker (optional, for containerized development)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/in-app-dynamic-reporting.git
cd in-app-dynamic-reporting

# Install dependencies
npm install
```

### Development

```bash
# Run a specific report
npm run start --workspace=example-reporting

# Example for CO2 report
npm run start --workspace=co2
```

### Docker Development

```bash
# Build and run with Docker
docker-compose up --build

# Access reports at:
# http://localhost:1000/{folder}/{report-name}/index.html
```

## 📊 Available Reports

### Global Reports
- **CO2**: Carbon footprint analysis and tracking
- **Energy**: Energy consumption monitoring
- **Map**: Interactive geographical data visualization
- **Energiebericht**: Comprehensive energy reporting

### Account-Specific Reports
- Located in `apps/accounts/{accountId}/{report-name}/`
- Customizable per LineMetrics account

## 🔧 Creating a New Report

1. **Create feature branch**:
   ```bash
   git checkout -b feature/new-report-name
   ```

2. **For account-specific report**:
   ```bash
   # Create directory structure
   mkdir -p apps/accounts/{accountId}/{report-name}
   
   # Copy template
   cp -r apps/examples/example apps/accounts/{accountId}/{report-name}
   ```

3. **Update configuration**:
   - Modify `package.json` name and build path
   - Update `public/index.html` config.js path
   - Configure environment variables for development

4. **Development setup**:
   ```bash
   # Copy environment template
   cp .env.example .env
   # Update with your credentials
   
   # Start development server
   npm run start --workspace={report-name}
   ```

## 🏗️ Build & Deployment

### Local Build

```bash
# Build all reports
npm run build

# Build specific report
npm run build --workspace={report-name}
```

### Production Deployment

The project uses GitLab CI/CD for automated deployment:

1. **Update version** in `Dockerfile`:
   ```dockerfile
   ARG SERVICE_VERSION="0.0.8"  # Increment version
   ```

2. **Push changes** - Pipeline automatically triggers on version changes

3. **Deployment targets**:
   - **Development**: RKE2 cluster (`lm-dynamic-reporting` namespace)
   - **Production**: K3S cluster (`dynamic-reporting` namespace)

## 🔐 API Authentication

The shared API client (`@project/api-client`) handles:
- OAuth 2.0 client credentials flow
- Automatic token refresh
- LRU caching for improved performance
- LineMetrics API v2 integration

## 🧪 Testing

```bash
# Test specific report
npm run test --workspace={report-name}

# Test all workspaces
npm run test --workspaces
```

## 📚 Documentation

- [Project Architecture](./CLAUDE.md) - Detailed technical documentation
- [API Client Documentation](./apps/shared/api-client/README.md)
- [Deployment Guide](./chart/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏢 About LineMetrics

This project is part of the LineMetrics Frontend Services, providing dynamic reporting capabilities for the LineMetrics IoT platform.

---

**Note**: This is a mirror of the original GitLab repository. For internal development and CI/CD, please refer to the GitLab instance.
