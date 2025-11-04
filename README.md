# HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY PROJECT

## YÊU CẦU HỆ THỐNG

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm hoặc yarn

---

## PHẦN 1: CÀI ĐẶT DATABASE

### Bước 1: Cài đặt PostgreSQL

**Windows:**
- Tải về từ: https://www.postgresql.org/download/windows/
- Chạy installer, set password cho user `postgres`

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Bước 2: Tạo Database

```bash
# Đăng nhập PostgreSQL
psql -U postgres

# Tạo database
CREATE DATABASE classroom_management;

# Tạo user (optional)
CREATE USER classroom_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE classroom_management TO classroom_user;

# Thoát
\q
```

---

## PHẦN 2: SETUP BACKEND

### Bước 1: Cài đặt dependencies

```bash
cd backend
npm install
```

Nội dung file `.env`:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/classroom_management?schema=public"
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

**LƯU Ý:** Thay `your_password` bằng password PostgreSQL của bạn

### Bước 2: Generate Prisma Client và Migrate Database

```bash
# Generate Prisma Client
npx prisma generate

# Chạy migration để tạo tables
npx prisma migrate dev --name init

# Seed dữ liệu mẫu
npm run prisma:seed
```

### Bước 3: Chạy Backend Server

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

Server sẽ chạy tại: **http://localhost:5000**

### Bước 4 Kiểm tra API

Test bằng curl hoặc Postman:

```bash
# Health check
curl http://localhost:5000/health

# Login test
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@classroom.com","password":"password123"}'
```

---

## PHẦN 3: SETUP FRONTEND

### Bước 1: Cài đặt dependencies

```bash
cd frontend
npm install
```

### Run Frontend

```bash
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:3000**

---

## PHẦN 4: KIỂM TRA HỆ THỐNG

### 1. Truy cập Frontend

Mở trình duyệt: http://localhost:3000

### 2. Đăng nhập với tài khoản test

**Admin:**
- Email: `admin@classroom.com`
- Password: `password123`

**Teacher:**
- Email: `teacher1@classroom.com`
- Password: `password123`

**Student:**
- Email: `student1@classroom.com`
- Password: `password123`

---

## PHẦN 5: DATABASE TOOLS

### Prisma Studio - GUI Database

```bash
cd backend
npm run prisma:studio
```

Truy cập: http://localhost:5555

Ở đây bạn có thể:
- Xem tất cả tables
- Thêm/sửa/xóa dữ liệu
- Xem relations giữa các tables

---

## CẤU TRÚC DATABASE

### Tables chính:

1. **users** - Thông tin người dùng (Admin/Teacher/Student)
2. **teachers** - Profile giáo viên
3. **students** - Profile sinh viên
4. **classrooms** - Thông tin lớp học
5. **classroom_enrollments** - Đăng ký lớp học (Many-to-Many)
6. **attendances** - Điểm danh

### Relationships:

```
User (1) ←→ (1) Teacher
User (1) ←→ (1) Student
User (1) ←→ (N) Classroom (as teacher)
Student (N) ←→ (N) Classroom (through enrollments)
Classroom (1) ←→ (N) Attendance
```

---

## TROUBLESHOOTING

### Lỗi: Cannot connect to PostgreSQL

**Giải pháp:**
- Kiểm tra PostgreSQL đã chạy chưa
- Kiểm tra DATABASE_URL trong .env
- Thử: `psql -U postgres` để test connection

### Lỗi: Prisma Client not generated / '"@prisma/client"' has no exported member 'PrismaClient'

**Giải pháp:**
```bash
cd backend
npm install @prisma/client prisma --save
npx prisma generate
```

### Lỗi: Port already in use

**Giải pháp:**
```bash
# Đổi port trong backend/.env
PORT=5001

# Hoặc kill process đang dùng port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Lỗi: CORS error

**Giải pháp:**
- Kiểm tra FRONTEND_URL trong backend/.env
- Kiểm tra NEXT_PUBLIC_API_URL trong frontend/.env.local

---

## SCRIPTS

### Backend:

```bash
# Development
npm run dev

# Build production
npm run build
npm start

# Reset database
npx prisma migrate reset

# Xem database
npm run prisma:studio
```

### Frontend:

```bash
# Development
npm run dev

# Build production
npm run build
npm start

# Lint
npm run lint
```

---

## API ENDPOINTS

### Authentication
- POST `/api/auth/login` - Đăng nhập
- POST `/api/auth/register` - Đăng ký
- GET `/api/auth/me` - Lấy profile

### Classrooms
- GET `/api/classrooms` - Lấy danh sách lớp
- GET `/api/classrooms/:id` - Chi tiết lớp
- POST `/api/classrooms` - Tạo lớp mới
- PUT `/api/classrooms/:id` - Cập nhật lớp
- DELETE `/api/classrooms/:id` - Xóa lớp
- POST `/api/classrooms/:id/enroll` - Đăng ký lớp
- GET `/api/classrooms/:id/students` - DS sinh viên

### Students
- GET `/api/students` - Lấy danh sách
- GET `/api/students/:id` - Chi tiết
- POST `/api/students` - Tạo mới
- PUT `/api/students/:id` - Cập nhật
- DELETE `/api/students/:id` - Xóa

---

## NEXT STEPS - HƯỚNG MỞ RỘNG

1. **Hoàn thiện CRUD cho Students page**
2. **Thêm chức năng Attendance (Điểm danh)**
3. **Thêm chức năng Grades (Nhập điểm)**
4. **Upload Avatar cho User**
5. **Export Excel/PDF reports**
6. **Real-time notifications (Socket.io)**
7. **Email notifications**
8. **Advanced search & filters**
9. **Role-based permissions**
10. **Deploy lên cloud (Vercel + Railway/Heroku)**
