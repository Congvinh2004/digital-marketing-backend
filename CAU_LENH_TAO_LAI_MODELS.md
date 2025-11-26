# Các câu lệnh để tạo lại models trong database

## Cách 1: Sử dụng Sequelize Sync (Từ models → Database)

### Câu lệnh cơ bản:

```bash
# Sử dụng script sync (khuyến nghị)
node sync_database_safe.js
```

### Hoặc trong code:

```javascript
// Trong file connectDB.js hoặc file khác
await db.sequelize.sync({ 
    alter: true,   // Thêm/cập nhật cột
    force: false   // KHÔNG xóa dữ liệu
});
```

### Các tùy chọn sync:

| Tùy chọn | Mô tả | Khi nào dùng |
|----------|-------|--------------|
| `sync()` | Tạo bảng nếu chưa có | Lần đầu tạo database |
| `sync({ alter: true })` | Thêm/cập nhật cột | Cập nhật schema, giữ dữ liệu |
| `sync({ force: true })` | Xóa và tạo lại | ⚠️ XÓA TẤT CẢ DỮ LIỆU |
| `sync({ alter: true, force: false })` | Cập nhật an toàn | ✅ Khuyến nghị |

## Cách 2: Sử dụng Sequelize CLI Migrations

### Tạo migration mới:

```bash
# Tạo file migration mới
npx sequelize-cli migration:generate --name create-products-table
```

### Chạy migrations:

```bash
# Chạy tất cả migrations chưa chạy
npm run db:migrate

# Hoặc
npx sequelize db:migrate
```

### Rollback migration:

```bash
# Rollback migration cuối cùng
npm run db:migrate:undo

# Hoặc rollback tất cả
npm run db:migrate:undo:all
```

## Cách 3: Tạo models từ database (Ngược lại)

### Generate models từ database hiện có:

```bash
# Tạo models từ database
npx sequelize-cli model:generate --name Product --attributes name:string,price:decimal

# Hoặc auto-generate từ database
npx sequelize-auto -o "./src/database/models" -d digital-marketing -h localhost -u root -p 3306 -e mysql
```

## So sánh các cách:

| Cách | Ưu điểm | Nhược điểm | Khi nào dùng |
|------|---------|------------|--------------|
| **Sync** | Đơn giản, nhanh | Không có lịch sử | Development, cập nhật nhanh |
| **Migrations** | Có lịch sử, kiểm soát tốt | Phức tạp hơn | Production, team work |
| **Auto-generate** | Tạo nhanh từ DB | Cần chỉnh sửa sau | Khi đã có database |

## Các câu lệnh thường dùng:

### 1. Tạo lại tất cả bảng từ models (XÓA DỮ LIỆU):

```bash
# ⚠️ CẢNH BÁO: XÓA TẤT CẢ DỮ LIỆU
node -e "require('./src/database/models').sequelize.sync({ force: true })"
```

### 2. Cập nhật schema (GIỮ DỮ LIỆU):

```bash
# ✅ An toàn: Chỉ thêm/cập nhật cột
node sync_database_safe.js
```

### 3. Chạy migrations:

```bash
# Chạy migrations
npm run db:migrate

# Xem trạng thái migrations
npx sequelize db:migrate:status
```

### 4. Reset migrations:

```bash
# Xóa sequelizemeta và chạy lại
node reset_sequelizemeta.js
npm run db:migrate
```

## Lưu ý quan trọng:

### ⚠️ `force: true`:
- ❌ **XÓA TẤT CẢ BẢNG** và dữ liệu
- ❌ **TẠO LẠI** từ đầu
- ⚠️ **CHỈ DÙNG KHI PHÁT TRIỂN**

### ✅ `alter: true`:
- ✅ Thêm các cột mới
- ✅ Cập nhật kiểu dữ liệu
- ✅ **KHÔNG xóa** dữ liệu
- ✅ **KHÔNG xóa** các cột đã tồn tại

### 🔒 Foreign Key Constraints:
- Có thể gây lỗi khi sync
- Script `sync_database_safe.js` tắt tạm thời foreign key checks

## Khuyến nghị cho trường hợp của bạn:

Vì bạn đã có database và muốn cập nhật theo models:

```bash
# 1. Backup database (nếu cần)
mysqldump -u root digital-marketing > backup.sql

# 2. Chạy sync an toàn
node sync_database_safe.js

# 3. Kiểm tra kết quả
```

## Troubleshooting:

### Lỗi: "Foreign key constraint is incorrectly formed"
- **Giải pháp:** Dùng `sync_database_safe.js` (tắt foreign key checks tạm thời)

### Lỗi: "Table already exists"
- **Giải pháp:** Dùng `alter: true` thay vì tạo mới

### Lỗi: "Column already exists"
- **Giải pháp:** Không sao, Sequelize sẽ bỏ qua

### Lỗi: "Data too long for column"
- **Giải pháp:** Kiểm tra và cập nhật dữ liệu hoặc kiểu dữ liệu

