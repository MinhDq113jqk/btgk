# Quản lý thư viện — NestJS và PostgreSQL

Ứng dụng gồm Book, Reader, BorrowedRecord và tài khoản User.
Các chức năng: tạo/đọc sách, độc giả; mượn sách; liệt kê lượt mượn;
đăng ký, đăng nhập JWT và phân quyền USER/ADMIN.

## Chạy local

Yêu cầu: Node.js 24.16 trở lên và PostgreSQL local.
Tạo CSDL riêng trong pgAdmin:

```sql
CREATE DATABASE btgk;
```

Cài thư viện và cấu hình:

```powershell
npm.cmd ci
Copy-Item .env.example .env
```

Điền thông tin PostgreSQL vào .env. Khi .env đã có sẵn, giữ tệp đang dùng.
Sinh khóa JWT trực tiếp trong .env, không hiển thị giá trị:

```powershell
node -e "const fs = require('node:fs'); const crypto = require('node:crypto'); const p = '.env'; const s = fs.readFileSync(p, 'utf8'); if (!/^JWT_SECRET=.+$/m.test(s)) fs.writeFileSync(p, s.replace(/^JWT_SECRET=.*$/m, 'JWT_SECRET=' + crypto.randomBytes(32).toString('hex')));"
npm.cmd run start:dev
```

DB_SYNCHRONIZE=true tự tạo bảng cho CSDL bài thực hành local.
Ứng dụng chạy tại http://localhost:3000.

## API và quyền

| API | Quyền |
| --- | --- |
| POST /auth/register, POST /auth/login | Công khai |
| GET /auth/profile, GET /books | USER hoặc ADMIN |
| POST /books | ADMIN |
| GET/POST /readers | ADMIN |
| GET/POST /borrowed-records | ADMIN |
| GET /, GET /health/database | Công khai |

Đăng ký tạo USER. Muốn cấp ADMIN cho tài khoản demo, quản trị viên CSDL
cập nhật cột role trong bảng users theo hướng dẫn Yêu cầu 4.
Tài khoản đăng nhập và hồ sơ độc giả là hai thực thể riêng;
ADMIN quản lý và lập lượt mượn cho độc giả.

Ngày gửi POST dùng YYYY-MM-DD. Ngày GET danh sách lượt mượn dùng DD/MM/YYYY.
Token Bearer hết hạn sau 1 giờ. Mật khẩu lưu hash scrypt có salt.

## Kiểm tra

```powershell
npm.cmd run build
npm.cmd run test:auth
```

Test auth dùng PostgreSQL btgk, kiểm tra 24 tình huống và dọn dữ liệu thử.
Hướng dẫn Postman và ảnh CSDL: HUONG_DAN_YEU_CAU_4.md.

## Bản nộp

Nộp mã nguồn, cấu hình và văn bản minh chứng. Không nộp .env,
node_modules, dist, *.tsbuildinfo. Không công khai mật khẩu, JWT hoặc hash.
CODE_BTGK.txt là bản tổng hợp code để đưa vào văn bản.

## Tham khảo

- https://github.com/nestjs/jwt
- https://docs.nestjs.com/security/authorization
