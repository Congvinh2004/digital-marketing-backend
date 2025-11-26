# Cấu trúc MVC

## Thư mục

```
src/
├── controllers/     # Xử lý request/response từ client
├── services/        # Business logic và xử lý dữ liệu
├── routes/          # Định nghĩa các routes (endpoints)
└── models/          # Database models (nếu cần)
```

## Quy tắc

### Controllers (`src/controllers/`)
- Nhận request từ routes
- Gọi services để xử lý business logic
- Trả về response cho client
- **KHÔNG** chứa business logic, chỉ xử lý HTTP

### Services (`src/services/`)
- Chứa business logic
- Tương tác với database
- Xử lý dữ liệu
- **KHÔNG** xử lý HTTP request/response

### Routes (`src/routes/`)
- Định nghĩa các endpoints
- Gọi controllers tương ứng
- **KHÔNG** chứa logic, chỉ routing

## Ví dụ luồng xử lý

```
Client Request 
  → Routes (mainRoutes.js)
  → Controller (mainController.js)
  → Service (mainService.js)
  → Database (db.js)
  → Service trả về data
  → Controller format response
  → Routes trả về cho Client
```

