# Hướng Dẫn API Category

## 1. Get All Categories
**GET** `/api/get-all-categories`

**Auth:** Không cần

**Tham số:** Không có

**Response:**
```json
{
  "errCode": 0,
  "errMessage": "Get all categories successfully",
  "data": [
    {
      "id": 1,
      "name": "Thực phẩm tươi sống",
      "slug": "thuc-pham-tuoi-song",
      "description": "Rau củ quả, thịt cá tươi sống",
      "status": "active",
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 2. Get Category By ID
**GET** `/api/get-category-by-id?id=1`

**Auth:** Không cần

**Query Parameters:**
- `id` (required): ID của category

**Response:**
```json
{
  "errCode": 0,
  "errMessage": "Get category by id successfully",
  "data": {
    "id": 1,
    "name": "Thực phẩm tươi sống",
    "slug": "thuc-pham-tuoi-song",
    "description": "Rau củ quả, thịt cá tươi sống",
    "status": "active",
    "products": [
      {
        "id": 1,
        "productName": "Rau cải",
        "price": 20000,
        "quantity": 100,
        "image": "..."
      }
    ]
  }
}
```

---

## 3. Create Category
**POST** `/api/create-category`

**Auth:** Cần token (verifyToken)

**Body (JSON):**
```json
{
  "name": "Đồ uống",           // required
  "slug": "do-uong",           // optional (tự động tạo từ name)
  "description": "Nước ngọt, bia rượu",  // optional
  "status": "active"           // optional (default: "active")
}
```

**Response:**
```json
{
  "errCode": 0,
  "errMessage": "Create category successfully",
  "data": {
    "id": 2,
    "name": "Đồ uống",
    "slug": "do-uong",
    "description": "Nước ngọt, bia rượu",
    "status": "active"
  }
}
```

**Lỗi:**
- `errCode: 1` - Thiếu tham số `name`
- `errCode: 2` - Slug đã tồn tại

---

## 4. Update Category
**PUT** `/api/update-category?id=1`

**Auth:** Cần token (verifyToken)

**Query Parameters:**
- `id` (required): ID của category

**Body (JSON):** Tất cả đều optional
```json
{
  "name": "Đồ uống mới",
  "slug": "do-uong-moi",
  "description": "Mô tả mới",
  "status": "active"
}
```

**Response:**
```json
{
  "errCode": 0,
  "errMessage": "Update category successfully",
  "data": {
    "id": 1,
    "name": "Đồ uống mới",
    "slug": "do-uong-moi",
    "description": "Mô tả mới",
    "status": "active"
  }
}
```

**Lỗi:**
- `errCode: 1` - Thiếu tham số `id`
- `errCode: 2` - Category không tồn tại hoặc slug đã tồn tại

---

## 5. Delete Category
**DELETE** `/api/delete-category?id=1`

**Auth:** Cần token (verifyToken)

**Query Parameters:**
- `id` (required): ID của category

**Response:**
```json
{
  "errCode": 0,
  "errMessage": "Delete category successfully"
}
```

**Lỗi:**
- `errCode: 1` - Thiếu tham số `id`
- `errCode: 2` - Category không tồn tại
- `errCode: 3` - Không thể xóa vì có sản phẩm liên quan

---

## Lưu Ý

- **Status:** Chỉ nhận giá trị `'active'` hoặc `'inactive'`
- **Slug:** Tự động tạo từ `name` nếu không cung cấp (chuyển thành chữ thường, thay khoảng trắng bằng dấu `-`)
- **Xóa category:** Chỉ xóa được khi không có sản phẩm nào thuộc category đó

