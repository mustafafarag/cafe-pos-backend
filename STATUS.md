
# ✅ CafePOS – Project Progress

This file outlines the core features and tasks completed as part of the development of the `cafe-pos-backend` project.

---

## 🔧 Backend Features

- [x] Express server setup with modular architecture
- [x] PostgreSQL integration with Sequelize ORM
- [x] Optimized the system for efficient read operations.
- [x] Security: Validate user inputs to prevent SQL injection and other threats.
- [x] Secure password hashing with bcrypt
- [x] API: Use a RESTful API for all operations.
- [x] Error Handling: Handle errors gracefully with clear feedback.
- [x] Dockerized backend with Docker and Docker Compose V2



---

## 📦 Item/Inventory Management:

Managers : 
- [x] Item management (Create, Read, Update, Delete)
- [x] Filtering by category (others, food, beverages) 
- [x] Sorting by name, price, expiry date, with ascending/descending options for numbers and dates.
- [x] Managers Are emailed 5 days before and on the expiry date with details and quantities of expiring items via Scheduled Tasks

Waiter :
- [x] Item management (User Waiter View Only non-expired items)


## 📅 Scheduled Tasks

- [x] Cron jobs using `node-cron`:
  - Auto-expire orders with pending Status orders after a 4H. (./jobs/expirePendingOrders.js)
  - Notify about items nearing expiry '5 days before and on the expiry date' (./jobs/itemExpiryNotifier.js).


## User Authentication:
Managers : 
- [x] Managers can handle Users management cashiers/waiters (Create, Read, Update, Delete) .
- [x] Added email verification for new user registration.
- [x] Implemented password reset functionality (Forgot and Rrest Password Flow).


## 📦 Item Management via CSV Import/Export
 - [x] Managers can import/export items with data (details and stock) via CSV, supporting both creation and updates using a unique identifier (SKU).



## Order Management:
- [x] Cashiers can manage customer orders: add/remove non-expired items, set quantities, mark as complete, and assign to a waiter.
- [x] Managers can view and orders with full details and status and manage (cancel) orders.
- [x] Implemented automatic total cost calculation based on items and quantities.
- [x] Orders auto-update to "expired" if still pending after 4 hours from creation via Scheduled Tasks.



## Documentation:

- [x] Document all API endpoints with expected inputs and outputs.
- [x] Use interactive Postman documentation with environment variables for the base URL.


## Database
- [x] Include a database schema diagram.
- [x] Provide necessary setup scripts for initializing the database.


## Deployment
- [x] Dockerized the application and provided deployment steps (NOT deployed Live).


---


