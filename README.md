# 🐝 Read Hive (Backend Only)

This is the **backend API** that powers **Read Hive** — a full-stack blogging platform built with **Angular (frontend)** and **Node.js (backend)**.  
It handles core features such as authentication, article and comment management, real-time notifications, and file uploads using **MySQL + Sequelize**.

**Note:** This repository is for the backend only. The frontend is hosted separately.

🌐 **Frontend Live Demo:** [https://read-hive-theta.vercel.app/global-feed](https://read-hive-theta.vercel.app/global-feed)

---

## ✨ Features

- 🔐 **Authentication (JWT)**
  - Register / Login
  - Secure password hashing (Bcrypt)
  - Role-based access (User / Admin)

- 📝 **Article Management (CRUD)**
  - Create, update, and delete articles
  - Slug generation for SEO-friendly URLs
  - Tagging support

- 💬 **Comments**
  - Comment on articles
  - Edit or delete comments
  - Like / Dislike functionality

- 👤 **User Profiles**
  - Update profile info
  - Upload avatar images (Multer)
  - View user-specific posts

- 🔔 **Real-Time Notifications (WebSocket)**
  - New comments
  - Post reactions
  - Followers and mentions

- 📁 **File Uploads**
  - Upload avatar images or cover images
  - Stored locally via Multer (can be extended to Cloud)

- 🛡️ **Security & Performance**
  - Helmet, Rate Limiting, CORS
  - Input validation and sanitization
  - UUID / NanoID / Slug for resource IDs

---

## 🛠️ Tech Stack (Backend)

- **Node.js**  
- **Express.js** v5 (modular routing)  
- **Sequelize** ORM  
- **MySQL**  
- **JWT + Bcrypt** – Authentication  
- **Socket.IO** – Real-time WebSocket notifications  
- **Multer** – File upload middleware  
- **dotenv** – Environment config  
- **Helmet + express-rate-limit** – Security  

---

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/leipriets/readhive-be.git
cd readhive-be
```
### 2. Install dependencies

```bash
npm install
```
### 3. Configure environment variables
Create a .env file in the root:
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=readhive_db
JWT_SECRET=your_secret_key
```


# Development mode with nodemon
```bash
npm run dev
```

# Production mode
```bash
npm start
```

---

### 🧹 Future Enhancements

Swagger API documentation

Cloudinary or S3 image uploads

Email notifications

Admin dashboard & moderation tools

### 📄 License
This project is licensed under the ISC License.

### 👨‍💻 Author
```
Developed by Leonardo Prieto
Frontend: Angular
Backend: Node.js + Sequelize
```