# Pastebin Lite

Pastebin Lite is a simple full-stack web application that allows users to create and share text pastes using a unique URL.  
Each paste can optionally expire based on time (TTL) or the number of views.

This project was built as part of a take-home assignment to demonstrate backend API design, persistence handling, and frontend integration.

---

## 🚀 Features

- Create a text paste
- Generate a shareable URL
- Optional time-based expiry (TTL)
- Optional view-count limit
- Safe rendering of paste content (no script execution)
- RESTful API with proper error handling

---

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (Atlas)
- Mongoose

### Frontend
- React (Vite)
- Tailwind CSS

---

## 📦 Persistence Layer

This application uses **MongoDB Atlas** as the persistence layer.

- Paste data is stored in a MongoDB collection
- Data persists across requests and server restarts
- Suitable for serverless and cloud deployment
- Handles expiry and view-count logic reliably

---

## ▶️ How to Run the Project Locally

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Sanjaypulavarthi/pastebin.git
cd pastebin

Run Backend:
cd server
npm install

create .env file for backend:
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
CLIENT_URL=http://localhost:5173
TEST_MODE=0

Start the server:
npm start

Server will run at:
http://localhost:5000

Test health check:
GET http://localhost:5000/api/healthz

Run Frontend (Client)

Open a new terminal:
cd pastebin-frontend
npm install

Create a .env file inside the frontend folder:
VITE_API_BASE_URL=http://localhost:5000

Frontend will run at:
http://localhost:5173
