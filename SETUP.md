
# ⚙️ Local Setup Instructions for geekyair-backend

This guide walks you through setting up the project locally for testing.

---

## ✅ Main Prerequisites

Regardless of the setup method you choose, ensure the following are available:

- [Git](https://git-scm.com/) – for cloning the repository
- [Node.js](https://nodejs.org/) 
- [Postman](https://www.postman.com/) – for testing the API


---

## 🐳 Docker Setup (Recommended) on (Ubuntu/Linux)

### 🧰 Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose v2](https://docs.docker.com/compose/)

### 🚀 Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/geekyair-backend.git
cd geekyair-backend

# 2. Add your environment variables
# See the environment variable reference: [Environment Variables](#️-environment-variables)
cp .env.exampl .env
# Edit .env to include DB, JWT, and email credentials

# 3. Build and run containers
docker compose up -d --build

# Or Use Docker Bake
#Enable Docker Bake for efficient multi-image builds with features like parallel builds and build matrices.

COMPOSE_BAKE=true docker compose up --build


# 4. App should be accessible at:
http://localhost:5000
```

### 🧹 Docker Cleanup

```bash
# Stop and remove containers
docker compose down

# Stop and remove containers + volumes (clean start)
docker compose down -v
```

---

## 💻 Local Setup (Without Docker) on (Ubuntu/Linux)

### 🧰 Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- PostgreSQL installed and running
  - A PostgreSQL user and password must be configured

### 🚀 Steps

```bash
# 1. Clone the repo
git clone https://github.com/your-username/geekyair-backend.git
cd geekyair-backend

# 2. Install dependencies
npm install

# 3. Configure your environment
# See the environment variable reference: [Environment Variables](#️-environment-variables)
cp .env.example .env
# Edit the .env file with your DB credentials and secrets

# 4. Run DB migrations
npx sequelize-cli db:create
npx sequelize-cli db:migrate

# 5. Start the server
npm run server
```

---

## ⚙️ Environment Variables

```env
# Server Configuration
PORT=5000
JWT_SECRET=your_jwt_secret_key

# PostgreSQL Database Configuration
DB_HOST=localhost           # Use 'db' if running via Docker
DB_NAME=geekyair
DB_USERNAME=postgres
DB_PASSWORD=your_db_password

# Email Configuration (used for Nodemailer)
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```
> ⚠️ **Note:**  
> If you're using Docker, set DB_HOST=db to match the database service name in docker-compose.yml.
---

## 🧪 Testing

Use Postman to test the endpoints.


## import the Postman Collection & Environment
1. Open Postman.
2. Import `./postman/geeky-backend.postman_environment.json`. 
3. Import `./postman/geeky-backend.postman_collection.json`.
4. Set the active environment to `geeky-backend.postman_environment.json`.
5. Use the interactive interface to test all endpoints with `{{base_url}}`.

Note: Make sure your local server is running at http://localhost:3000 (or as defined in `base_url`).


📘 For full testing instructions, see the [Testing Flow Guide](./TESTING_FLOW.md)

