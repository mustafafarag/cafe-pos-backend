
# 🧪 Testing Flow for geekyair-backend

This guide explains how to perform the initial steps of the backend system, including manager creation, verification, and authorized access.

---

## 👤 Step 1: Create the Initial Manager

Run the following script manually to create the first manager account:

```bash
node scripts/create-initial-manager.js
```

This will:
- Create a user with the role `manager`
- Send a verification email to the manager's email address

---

## ✉️ Step 2: Verify the Manager's Email

Check the inbox of the email used in step 1. You will receive a verification link like this:

```
{{baseUrl}}/auth/verify/{{verificationToken}}
```

Visit the link in your browser to complete email verification.

> ⚠️ Note: The manager **must be verified** before being allowed to log in and use the system.

---

## 🔐 Step 3: Log in to Get Access Token

Use the following API endpoint to log in:

```
POST {{baseUrl}}/auth/login
Content-Type: application/json
```

Request body:
```json
{
  "email": "manager@example.com",
  "password": "your_password"
}
```

On success, the response will include a `token`:

```json
{
  "token": "your_access_token"
}
```

---

## 🔑 Step 4: Use the Token for Authorization

For all protected routes, include the token in the request headers:

```
Authorization: Bearer your_access_token
```

You are now ready to Test the remanining endpoints 


---


