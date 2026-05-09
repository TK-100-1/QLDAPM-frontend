# 🌊 QLDAPM Frontend

> **Nền tảng giao diện cho hệ thống quản lý giá coin và cảnh báo, xây dựng bằng Next.js App Router với cấu trúc module rõ ràng, dễ mở rộng và dễ bảo trì.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![NextUI](https://img.shields.io/badge/NextUI-2-000000?style=flat-square)](https://nextui.org/)
[![License](https://img.shields.io/badge/License-Internal-lightgrey?style=flat-square)]()

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Tính năng nổi bật](#-tính-năng-nổi-bật)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng)
- [Backend](#-backend)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Thành viên](#-thành-viên)

---

## 🎯 Tổng quan

**QLDAPM Frontend** là phần giao diện của hệ thống quản lý giá coin và cảnh báo. Dự án được tổ chức theo kiến trúc **Next.js App Router**, tách rõ các lớp như `app`, `components`, `layouts`, `libs`, `provider`, `types` và `views` để thuận tiện cho việc phát triển, mở rộng và bảo trì.

Ứng dụng hỗ trợ các luồng chính như:

- Xem market và dữ liệu coin
- Xem chi tiết coin với biểu đồ và thông tin liên quan
- Đăng nhập, đăng ký và quản lý phiên người dùng
- Quản lý cảnh báo và các trang admin

---

## 🧱 Backend

Phần backend của dự án nằm trong thư mục [QLDAPM-backend](../QLDAPM-backend) và được xây dựng bằng **Node.js + Express**. Đây là lớp xử lý API, xác thực, lưu trữ dữ liệu và các luồng nghiệp vụ cho frontend.

### Thành phần chính

- `src/app.js`: điểm khởi động của backend.
- `src/config/database.js`: cấu hình kết nối cơ sở dữ liệu.
- `src/middlewares`: các middleware như xác thực và upload file.
- `src/services/price`: xử lý dữ liệu giá coin, kline, funding rate và websocket.
- `src/services/trigger`: xử lý cảnh báo và logic phát thông báo.
- `src/services/admin`: xử lý người dùng, thanh toán, xác thực và các tác vụ quản trị.

### Công nghệ backend

| Thành phần   | Công nghệ                         |
| ------------ | --------------------------------- |
| Runtime      | Node.js                           |
| Framework    | Express                           |
| Database     | MongoDB                           |
| Xác thực     | JWT                               |
| Upload       | Multer                            |
| Realtime     | WebSocket / express-ws            |
| Email        | node-mailjet                      |
| Tài liệu API | swagger-jsdoc, swagger-ui-express |

### Chạy backend

```bash
cd "QLDAPM-backend"
npm install
npm run dev
```

Mặc định backend sẽ khởi động bằng `src/app.js` và cung cấp các API cho frontend sử dụng.

---

## ✨ Tính năng nổi bật

### 🔍 Theo dõi thị trường

- Hiển thị danh sách coin và dữ liệu thị trường theo thời gian thực.
- Tích hợp các màn hình xem chi tiết coin và biểu đồ biến động.

### 🔐 Xác thực người dùng

- Hỗ trợ đăng nhập, đăng ký và quên mật khẩu.
- Phân tách rõ các route authentication và private routes.

### 🚨 Quản lý cảnh báo

- Tạo, xem và quản lý cảnh báo theo tài khoản.
- Hỗ trợ các màn hình thao tác cảnh báo riêng biệt.

### 🧩 Kiến trúc rõ ràng

- Tách biệt giao diện dùng chung, layout và logic gọi dữ liệu.
- Dễ mở rộng các module như market, coin, alerts và admin.

---

## 🛠 Công nghệ sử dụng

| Thành phần | Công nghệ                                      |
| ---------- | ---------------------------------------------- |
| Framework  | Next.js 14                                     |
| UI         | React 18, NextUI                               |
| Ngôn ngữ   | TypeScript                                     |
| Styling    | Tailwind CSS                                   |
| Biểu đồ    | Chart.js, lightweight-charts, Highcharts React |
| Tiện ích   | Axios, next-themes, framer-motion, sonner      |

---

## 🚀 Hướng dẫn cài đặt

### 📋 Yêu cầu hệ thống

- Node.js 18 trở lên
- npm đi kèm với Node.js
- Backend API đang chạy nếu cần kết nối dữ liệu thật

### 📦 Cài đặt dự án

```bash
cd "QLDAPM-frontend"
npm install
```

### ▶ Chạy dự án ở chế độ phát triển

```bash
npm run dev
```

Sau khi chạy xong, mở trình duyệt tại:

```bash
http://localhost:3000
```

### 🧪 Các lệnh thường dùng

```bash
npm run build
npm start
npm run lint
```

---

## 📱 Hướng dẫn sử dụng

1. Mở trang chủ để xem landing page và điều hướng đến các tính năng chính.
2. Đăng ký hoặc đăng nhập nếu muốn dùng các trang private.
3. Vào trang market để xem danh sách coin và tìm kiếm theo tên hoặc mã coin.
4. Mở trang chi tiết coin để xem dữ liệu chi tiết, biểu đồ và thông tin liên quan.
5. Truy cập trang alerts để tạo, xem hoặc quản lý cảnh báo.
6. Nếu có quyền quản trị, vào nhóm trang admin để theo dõi dashboard, người dùng và thanh toán.

### Tài khoản dùng thử

| Vai trò | Email                   | Mật khẩu        |
| ------- | ----------------------- | --------------- |
| Admin   | admintest@gmail.com     | 123456A@        |
| User    | phucloctho054@gmail.com | Ducphuong123@@@ |

---

## 🏗 Cấu trúc thư mục

```text
QLDAPM-frontend/
├── 📁 .github
│   └── 📁 workflows
│       ├── ⚙️ ci.yml
│       └── ⚙️ deploy.yml
├── 📁 Documents
│   ├── 📁 API DOCS
│   │   └── ⚙️ Document.yaml
│   ├── 📁 API Specs (Samples API for Module Backend)
│   │   ├── 📝 API Specification for Coin Price System v1.2.md
│   │   └── 📝 Secret and API Usage.md
│   └── 📁 Coding Style Docs
│       └── 📕 Code Style.pdf
├── 📁 public
│   ├── 📁 landingpage
│   │   ├── 🖼️ Component 1.svg
│   │   ├── 🖼️ Component 2.svg
│   │   └── 🖼️ Component 3.svg
│   ├── 🖼️ google.svg
│   ├── 🖼️ hcmutLogo.png
│   ├── 🖼️ logo.png
│   └── 🖼️ user.svg
├── 📁 src
│   ├── 📁 app
│   │   ├── 📁 (authentication)
│   │   │   ├── 📁 forgot_password
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 signin
│   │   │   │   └── 📄 page.tsx
│   │   │   └── 📁 signup
│   │   │       └── 📄 page.tsx
│   │   ├── 📁 (private)
│   │   │   ├── 📁 admin
│   │   │   │   ├── 📁 dashboard
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 payments
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 users
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   └── 📄 layout.tsx
│   │   │   ├── 📁 alerts
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 coin
│   │   │   │   └── 📁 [id]
│   │   │   │       └── 📄 page.tsx
│   │   │   ├── 📁 market
│   │   │   │   └── 📄 page.tsx
│   │   │   └── 📄 layout.tsx
│   │   ├── 📁 (public)
│   │   │   └── 📁 landing_page
│   │   │       └── 📄 LandingPage.tsx
│   │   ├── 📁 api
│   │   │   ├── 📁 funding
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 future
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 kline
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 proxy
│   │   │   │   └── 📁 coin
│   │   │   │       ├── 📁 [id]
│   │   │   │       │   ├── 📁 history
│   │   │   │       │   │   └── 📄 route.ts
│   │   │   │       │   └── 📄 route.ts
│   │   │   │       └── 📁 list
│   │   │   │           └── 📄 route.ts
│   │   │   └── 📁 spot
│   │   │       └── 📄 route.ts
│   │   ├── 📁 test
│   │   │   └── 📄 page.tsx
│   │   ├── 🎨 globals.css
│   │   ├── 📄 icon.ico
│   │   ├── 📄 layout.tsx
│   │   └── 📄 page.tsx
│   ├── 📁 components
│   │   ├── 📁 AlertManager
│   │   ├── 📁 Box
│   │   │   ├── 📁 FlexBox
│   │   │   │   └── 📄 index.tsx
│   │   │   └── 📁 GridBox
│   │   │       └── 📄 index.tsx
│   │   ├── 📁 Container
│   │   │   └── 📄 index.tsx
│   │   ├── 📁 Form
│   │   │   └── 📄 index.tsx
│   │   ├── 📁 Heading
│   │   │   └── 📄 index.tsx
│   │   ├── 📁 Logo
│   │   │   └── 📄 index.tsx
│   │   ├── 📁 RenderCase
│   │   │   └── 📄 index.tsx
│   │   └── 📁 VIPUpgradeGuard
│   │       └── 📄 index.tsx
│   ├── 📁 layouts
│   │   ├── 📁 private_page
│   │   │   └── 📁 Navbar
│   │   │       └── 📄 index.tsx
│   │   └── 📁 public_page
│   │       ├── 📁 Footer
│   │       │   └── 📄 index.tsx
│   │       └── 📁 Navbar
│   │           └── 📄 index.tsx
│   ├── 📁 libs
│   │   ├── 📁 hooks
│   │   │   ├── 📄 index.ts
│   │   │   └── 📄 useDebounce.ts
│   │   ├── 📁 serverAction
│   │   │   ├── 📄 adminAction.ts
│   │   │   ├── 📄 alert.ts
│   │   │   ├── 📄 auth.ts
│   │   │   ├── 📄 coin.ts
│   │   │   └── 📄 user.ts
│   │   ├── 📁 serverFetch
│   │   │   ├── 📄 adminFetch.ts
│   │   │   ├── 📄 index.ts
│   │   │   ├── ⚙️ mockCoinData.json
│   │   │   ├── ⚙️ mockCoinList.json
│   │   │   └── ⚙️ mockHistoryData.json
│   │   └── 📄 index.ts
│   ├── 📁 provider
│   │   ├── 📁 AuthProvider
│   │   │   └── 📄 index.tsx
│   │   └── 📁 ThemeProvider
│   │       └── 📄 index.tsx
│   ├── 📁 types
│   │   ├── 📄 alert.ts
│   │   ├── 📄 coin.ts
│   │   ├── 📄 global.d.ts
│   │   └── 📄 user.ts
│   ├── 📁 views
│   │   ├── 📁 admin
│   │   │   ├── 📄 DashboardView.tsx
│   │   │   ├── 📄 PaymentsView.tsx
│   │   │   └── 📄 UsersView.tsx
│   │   ├── 📁 alert
│   │   │   ├── 📁 components
│   │   │   │   ├── 📁 AddAlertModal
│   │   │   │   │   └── 📄 index.tsx
│   │   │   │   ├── 📁 CoinSymbolSelect
│   │   │   │   │   └── 📄 index.tsx
│   │   │   │   ├── 📁 TriggerForm
│   │   │   │   │   └── 📄 index.tsx
│   │   │   │   └── 📁 TriggerList
│   │   │   │       ├── 📄 TriggerModal.tsx
│   │   │   │       └── 📄 index.tsx
│   │   │   └── 📄 index.tsx
│   │   ├── 📁 authentication
│   │   │   ├── 📁 ForgotPasswordForm
│   │   │   │   ├── 📄 ResetPasswordForm.tsx
│   │   │   │   ├── 📄 SendEmailForm.tsx
│   │   │   │   └── 📄 index.tsx
│   │   │   ├── 📁 SigninForm
│   │   │   │   └── 📄 index.tsx
│   │   │   ├── 📁 SignupForm
│   │   │   │   └── 📄 index.tsx
│   │   │   └── 📁 components
│   │   │       ├── 📁 ConfirmButton
│   │   │       │   └── 📄 index.tsx
│   │   │       └── 📁 ContinueButton
│   │   │           └── 📄 index.tsx
│   │   ├── 📁 coin
│   │   │   ├── 📄 Breadcrumbs.tsx
│   │   │   ├── 📄 CoinDetail.tsx
│   │   │   ├── 📄 HistoryChart.tsx
│   │   │   ├── 📄 KlineChart.tsx
│   │   │   ├── 📄 MarketReplay.tsx
│   │   │   └── 📄 SidebarStats.tsx
│   │   ├── 📁 landing_page
│   │   │   └── 📄 HeroSection.tsx
│   │   ├── 📁 market
│   │   │   ├── 📄 CoinList.tsx
│   │   │   ├── 📄 Pagnitation.tsx
│   │   │   └── 📄 SearchInput.tsx
│   │   └── 📁 user_profile
│   │       ├── 📄 UserActionModal.tsx
│   │       └── 📄 index.tsx
│   └── 📄 middleware.ts
├── ⚙️ .env.example
├── ⚙️ .eslintrc.json
├── ⚙️ .gitignore
├── ⚙️ .hintrc
├── 🐳 Dockerfile
├── 📝 README.md
├── 📄 next.config.mjs
├── ⚙️ package-lock.json
├── ⚙️ package.json
├── 📄 postcss.config.mjs
├── 📄 tailwind.config.ts
└── ⚙️ tsconfig.json

QLDAPM-backend/
├── 📁 .claude
│   └── ⚙️ settings.local.json
├── 📁 .github
│   └── 📁 workflows
│       ├── ⚙️ ci.yml
│       └── ⚙️ deploy.yml
├── 📁 src
│   ├── 📁 config
│   │   └── 📄 database.js
│   ├── 📁 middlewares
│   │   ├── 📄 authMiddleware.js
│   │   └── 📄 upload.js
│   ├── 📁 scripts
│   │   └── 📄 makeAdmin.js
│   ├── 📁 services
│   │   ├── 📁 admin
│   │   │   ├── 📁 controllers
│   │   │   │   ├── 📄 adminController.js
│   │   │   │   ├── 📄 authController.js
│   │   │   │   ├── 📄 googleController.js
│   │   │   │   ├── 📄 paymentController.js
│   │   │   │   └── 📄 userController.js
│   │   │   ├── 📁 models
│   │   │   │   ├── 📄 Order.js
│   │   │   │   └── 📄 User.js
│   │   │   ├── 📁 momo
│   │   │   │   ├── 📄 momoCallback.js
│   │   │   │   └── 📄 momoPayment.js
│   │   │   ├── 📁 routes
│   │   │   │   └── 📄 routes.js
│   │   │   └── 📁 utils
│   │   │       ├── 📄 cleanupUtils.js
│   │   │       ├── 📄 emailUtils.js
│   │   │       ├── 📄 googleVerify.js
│   │   │       ├── 📄 tokenUtils.js
│   │   │       ├── 📄 upgradeAmount.js
│   │   │       └── 📄 validation.js
│   │   ├── 📁 price
│   │   │   ├── 📁 controllers
│   │   │   │   ├── 📄 fundingRate.js
│   │   │   │   ├── 📄 futurePrice.js
│   │   │   │   ├── 📄 kline.js
│   │   │   │   └── 📄 spotPrice.js
│   │   │   ├── 📁 routes
│   │   │   │   └── 📄 routes.js
│   │   │   ├── 📁 utils
│   │   │   │   └── 📄 showError.js
│   │   │   └── 📁 websocket
│   │   │       ├── 📄 fundingRateSocket.js
│   │   │       ├── 📄 futurePriceSocket.js
│   │   │       ├── 📄 klineSocket.js
│   │   │       ├── 📄 marketCapSocket.js
│   │   │       └── 📄 spotPriceSocket.js
│   │   └── 📁 trigger
│   │       ├── 📁 controllers
│   │       │   ├── 📄 alertHandler.js
│   │       │   ├── 📄 indicatorHandler.js
│   │       │   ├── 📄 symbolAlert.js
│   │       │   └── 📄 userHandler.js
│   │       ├── 📁 models
│   │       │   └── 📄 Alert.js
│   │       ├── 📁 routes
│   │       │   └── 📄 routes.js
│   │       ├── 📁 services
│   │       │   ├── 📄 alertChecker.js
│   │       │   └── 📄 alertLogic.js
│   │       └── 📁 utils
│   │           └── 📄 alertEmail.js
│   └── 📄 app.js
├── 📁 uploads
├── ⚙️ .dockerignore
├── ⚙️ .env.example
├── ⚙️ .gitignore
├── 🐳 Dockerfile
├── ⚙️ docker-compose.yml
├── ⚙️ package-lock.json
└── ⚙️ package.json
```
---

## 👥 Thành viên

| Họ và tên             | MSSV    | Email                              |
| --------------------- | ------- | ---------------------------------- |
| HỒ QUỐC KHƯƠNG        | 2211709 | khuong.hobknet4869@hcmut.edu.vn    |
| HUỲNH ANH CHÍ KIỆT    | 2013563 | kiet.huynh100@hcmut.edu.vn         |
| NGUYỄN TRUNG KIÊN     | 2211729 | kien.nguyenkien130804@hcmut.edu.vn |
| PHAN HUY THỊNH        | 2313305 | thinh.phanheavything@hcmut.edu.vn  |
| THÁI KIM LONG         | 2211899 | long.thai1210@hcmut.edu.vn         |
| NGUYỄN ĐĂNG KHOA      | 2211620 | khoa.nguyen21924@hcmut.edu.vn      |
| NGUYỄN NGỌC THÀNH ĐẠT | 2111013 | dat.nguyen0412@hcmut.edu.vn        |
| NGUYỄN ĐỨC PHƯƠNG     | 2312749 | phuong.nguyendph10623@hcmut.edu.vn |

---

<div align="center">

**Made with care for QLDAPM Frontend**

</div>
