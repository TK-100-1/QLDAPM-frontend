# 🌊 QLDAPM — Coin Price Monitoring & Alert System

> **Hệ thống theo dõi giá coin và cảnh báo thông minh, hỗ trợ realtime market tracking, quản lý cảnh báo cá nhân và dashboard quản trị, được xây dựng với Next.js App Router và Node.js/Express.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb)](https://mongodb.com/)

---

# 📚 Table of Contents

- [📌 Overview](#-overview)
- [✨ Main Features](#-main-features)
- [🧱 System Architecture](#-system-architecture)
- [🛠 Technologies](#-technologies)
- [🚀 Installation](#-installation)
- [📱 Usage](#-usage)
- [📂 Project Structure](#-project-structure)
- [🔌 Backend Services](#-backend-services)
- [👥 Team Members](#-team-members)

---

# 📌 Overview

**QLDAPM** là hệ thống quản lý giá coin và cảnh báo, hỗ trợ người dùng theo dõi thị trường crypto theo thời gian thực, xem biểu đồ biến động giá, tạo cảnh báo thông minh và quản lý tài khoản cá nhân.

Dự án được chia thành:

- **Frontend**: xây dựng bằng Next.js App Router
- **Backend**: xây dựng bằng Node.js + Express
- **Realtime Services**: WebSocket cho dữ liệu thị trường
- **Database**: MongoDB

---

# ✨ Main Features

## 🔍 Market Tracking

- Hiển thị danh sách coin theo thời gian thực
- Theo dõi market price, funding rate và kline
- Tìm kiếm coin theo symbol hoặc tên
- Hỗ trợ trang coin detail với chart trực quan

## 📈 Coin Analytics

- Kline chart
- Historical price chart
- Market replay
- Sidebar statistics
- Funding rate tracking

## 🚨 Smart Alert System

- Tạo cảnh báo theo giá coin
- Hỗ trợ nhiều điều kiện trigger
- Quản lý danh sách alert
- Gửi thông báo qua email
- Cooldown & dedupe alert

## 🔐 Authentication & Authorization

- Đăng ký
- Đăng nhập
- Quên mật khẩu
- JWT authentication
- Private route protection
- Role-based admin pages

## 👨‍💼 Admin Dashboard

- User management
- Payment management
- Dashboard thống kê
- Admin middleware protection

---

# 🧱 System Architecture

```text
┌────────────────────┐
│     Frontend       │
│  Next.js App Router│
└─────────┬──────────┘
          │ HTTP / WS
┌─────────▼──────────┐
│      Backend       │
│ Node.js + Express  │
└─────────┬──────────┘
          │
 ┌────────▼─────────┐
 │     MongoDB      │
 └──────────────────┘
```

---

# 🛠 Technologies

## Frontend

| Category  | Technology                               |
| --------- | ---------------------------------------- |
| Framework | Next.js 14                               |
| UI        | React 18, NextUI                         |
| Language  | TypeScript                               |
| Styling   | Tailwind CSS                             |
| Charts    | Chart.js, Highcharts, lightweight-charts |
| Animation | framer-motion                            |
| Utilities | Axios, next-themes, sonner               |

## Backend

| Category       | Technology                        |
| -------------- | --------------------------------- |
| Runtime        | Node.js                           |
| Framework      | Express                           |
| Database       | MongoDB                           |
| Authentication | JWT                               |
| Upload         | Multer                            |
| Realtime       | WebSocket / express-ws            |
| Email Service  | node-mailjet                      |
| API Docs       | swagger-jsdoc, swagger-ui-express |

---

# 🚀 Installation

## 📋 Requirements

- Node.js 18+
- npm
- MongoDB
- Backend API running

---

## 📦 Frontend Setup

```bash
cd QLDAPM-frontend
npm install
npm run dev
```

Frontend chạy tại:

```bash
http://localhost:3000
```

---

## 📦 Backend Setup

```bash
cd QLDAPM-backend
npm install
npm run dev
```

---

## 🧪 Common Commands

```bash
npm run build
npm start
npm run lint
```

---

# 🌐 Demo

## 🌐 Live Demo: [cprice.site](https://cprice.site/signin)

## 🎥 Demo Video : https://www.youtube.com/watch?v=sXasN6woWLQ

---

# 📱 Usage

1. Mở landing page để truy cập hệ thống
2. Đăng ký hoặc đăng nhập
3. Truy cập market page để xem danh sách coin
4. Xem coin detail để theo dõi biểu đồ
5. Tạo alert tại trang alerts
6. Quản lý dashboard nếu có quyền admin

---

# 🧪 Demo Accounts

| Role  | Email                   | Password        |
| ----- | ----------------------- | --------------- |
| Admin | admintest@gmail.com     | 123456A@        |
| User  | phucloctho054@gmail.com | Ducphuong123@@@ |

---

# 📂 Project Structure

## Frontend Structure

```text
QLDAPM-frontend/
├── src/
│   ├── app/
│   │   ├── (authentication)
│   │   ├── (private)
│   │   ├── (public)
│   │   ├── api/
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── AlertManager
│   │   ├── Box
│   │   ├── Form
│   │   └── VIPUpgradeGuard
│   │
│   ├── layouts/
│   │   ├── private_page
│   │   └── public_page
│   │
│   ├── libs/
│   │   ├── hooks
│   │   ├── serverAction
│   │   └── serverFetch
│   │
│   ├── provider/
│   │   ├── AuthProvider
│   │   └── ThemeProvider
│   │
│   ├── types/
│   └── views/
│
├── public/
├── Dockerfile
└── package.json
```

---

## Backend Structure

```text
QLDAPM-backend/
├── src/
│   ├── config/
│   ├── middlewares/
│   ├── scripts/
│   ├── services/
│   │   ├── admin/
│   │   ├── price/
│   │   └── trigger/
│   │
│   └── app.js
│
├── uploads/
├── Dockerfile
└── package.json
```

---

# 🔌 Backend Services

## 🧑‍💼 Admin Service

```text
services/admin/
├── controllers/
├── models/
├── routes/
├── momo/
└── utils/
```

Chức năng:

- Authentication
- User management
- Payment handling
- Google login
- JWT token handling

---

## 📈 Price Service

```text
services/price/
├── controllers/
├── routes/
├── websocket/
└── utils/
```

Chức năng:

- Spot price
- Future price
- Funding rate
- Kline data
- Realtime websocket streaming

---

## 🚨 Trigger Service

```text
services/trigger/
├── controllers/
├── models/
├── routes/
├── services/
└── utils/
```

Chức năng:

- Alert checking
- Trigger logic
- Email notification
- User alert management

---

# 👥 Team Members

| Name                  | Student ID | Email                              |
| --------------------- | ---------- | ---------------------------------- |
| HỒ QUỐC KHƯƠNG        | 2211709    | khuong.hobknet4869@hcmut.edu.vn    |
| HUỲNH ANH CHÍ KIỆT    | 2013563    | kiet.huynh100@hcmut.edu.vn         |
| NGUYỄN TRUNG KIÊN     | 2211729    | kien.nguyenkien130804@hcmut.edu.vn |
| PHAN HUY THỊNH        | 2313305    | thinh.phanheavything@hcmut.edu.vn  |
| THÁI KIM LONG         | 2211899    | long.thai1210@hcmut.edu.vn         |
| NGUYỄN ĐĂNG KHOA      | 2211620    | khoa.nguyen21924@hcmut.edu.vn      |
| NGUYỄN NGỌC THÀNH ĐẠT | 2111013    | dat.nguyen0412@hcmut.edu.vn        |
| NGUYỄN ĐỨC PHƯƠNG     | 2312749    | phuong.nguyendph10623@hcmut.edu.vn |

---

<div align="center">

### 🌊 Made with care for QLDAPM

⭐ If you find this project helpful, please give it a star!

[⬆ Back to Top](#-qldapm--coin-price-monitoring--alert-system)

</div>
