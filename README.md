# PCE

PCE is a full-stack shopping and budget management application built to help users track purchase items, manage a spending limit, and monitor savings or overspend in a simple, responsive dashboard.

The project combines a React frontend with an Express API and MongoDB persistence, making it a practical example of a production-style personal finance workflow with realistic deployment and resilience patterns.

## Features

- Add, update, and remove shopping items with quantity and price
- Set and update a monthly or weekly spending budget
- View real-time spending summaries such as total spent, remaining balance, and percentage used
- Track item history and timestamps for recent purchases
- Secure auth API with registration and login support using JWT
- Responsive UI for desktop and mobile use
- MongoDB-backed persistence for reliable data storage
- Kubernetes deployment manifests and chaos-testing support for resilience experiments

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Validation: Zod
- Database: MongoDB + Mongoose
- Authentication: JWT + bcryptjs
- Deployment: Docker / Kubernetes
- Testing/Resilience: custom load and chaos simulation scripts

## Architecture Overview

```text
client/                Frontend React application
Server/                Backend Express application
  auth/                Registration/login logic
  budget/              Budget endpoints and logic
  cartList/            Shopping item CRUD endpoints
  dashboard/           Dashboard summary endpoints
  common/              DB, validation, error handling, chaos middleware
k8s/                   Kubernetes manifests for app and chaos scenarios
load-test.js           Load and concurrency validation script
```

## Prerequisites

Before running the application, make sure you have:

- Node.js 18+ and npm
- MongoDB running locally or reachable via a Mongo URI
- Optional: Docker and Kubernetes tools for deployment testing

## Local Setup

1. Clone the repository

```bash
git clone <repository-url>
cd PCE
```

2. Install root dependencies

```bash
npm install
```

3. Install frontend dependencies

```bash
cd client
npm install
cd ..
```

4. Create a `.env` file in the project root

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/shopping_budget_tracker
JWT_SECRET=your_secure_secret_here
ENABLE_CHAOS=false
CHAOS_DELAY_MS=0
CHAOS_FAILURE_RATE=0
```

## Run the Application

### Start the API server

```bash
npm run dev
```

The server runs on `http://localhost:5001`.

### Start the frontend

```bash
npm run client
```

The frontend is served by Vite on `http://localhost:5173` and proxies API requests to the backend.

## Authentication

The API provides basic user account flows:

- `POST /api/auth/register`
- `POST /api/auth/login`

These endpoints are responsible for user registration and authentication with JWT-based access.

## Core API Endpoints

### Shopping items

- `GET /api/items`
- `POST /api/items`
- `PATCH /api/items/:id`
- `DELETE /api/items/:id`

### Budget

- `GET /api/budget`
- `PUT /api/budget`

### Dashboard summary

- `GET /api/dashboard`

The dashboard endpoint aggregates the current item list and budget data into summary metrics for a user-facing overview.

## Sample Workflow

1. Register or log in through the frontend or API.
2. Add grocery items with name, quantity, and price.
3. Set the desired spending budget.
4. Monitor total spend, remaining balance, and the percentage of budget consumed.
5. Remove items securely using the confirmation flow included in the UI.

## Docker and Kubernetes

A Dockerfile is included for containerization, and the `k8s/` folder contains deployment manifests for running the app in a Kubernetes environment.

### Deploy locally with Kubernetes

```bash
kubectl apply -f k8s/pce-app.yaml
```

The provided manifests include:

- MongoDB deployment and service
- PCE server deployment with health checks
- NodePort exposure for the API

### Chaos experiments

The project also includes chaos-related manifests in the `k8s/` folder:

- `chaos-cpu-memory-stress.yaml`
- `chaos-db-partition.yaml`
- `chaos-network-delay.yaml`

These are useful for testing resilience under degraded conditions and align with the repository's fault-injection testing patterns.

## Load and Chaos Testing

The project includes a custom load tester at `load-test.js` to validate concurrency and latency behavior.

Run it with:

```bash
node load-test.js
```

You can also target a different service URL:

```bash
node load-test.js http://localhost:5001
```

The project includes a chaos middleware that can simulate latency or failure when enabled via environment variables or request headers.

## Project Structure

```text
PCE/
├── client/                  # React frontend
├── Server/                 # Express backend
├── k8s/                    # Kubernetes manifests
├── Dockerfile              # Container image definition
├── load-test.js            # Load/concurrency validation script
├── package.json            # Root scripts and dependencies
├── .gitignore
├── README.md
└── ...
```

## Scripts

Root scripts:

```bash
npm start        # Start the production API server
npm run dev      # Start the API in watch mode
npm run client   # Start the React dev server
npm run client:build  # Build the frontend for production
```

## Notes

- The app is designed as a practical budgeting and shopping companion rather than a general-purpose ecommerce platform.
- Some UI flows include a hardcoded PIN confirmation for destructive actions, which is useful for demo purposes but should be replaced with a more secure production auth flow when needed.
- The chaos middleware is intentionally designed for testing and failover scenarios, not for normal production usage unless explicitly enabled.

## License

This project uses the ISC license as defined in the root `package.json`.

## Contributing

Contributions are welcome. To improve the project:

1. Fork the repository
2. Create a feature branch
3. Add or update tests where applicable
4. Submit a clean pull request with a clear summary

---

Built as a lightweight, budget-aware shopping tracker with production-style deployment and resilience considerations.
