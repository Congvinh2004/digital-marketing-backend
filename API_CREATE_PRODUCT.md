# Hướng Dẫn API Create Product

## Create Product
**POST** `/api/create-product`

**Auth:** Không cần (nhưng nên có verifyToken để bảo mật)

**Body (JSON):**

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả | Ràng buộc |
|---------|--------------|----------|-------|-----------|
| `productName` | String | **Có** | Tên sản phẩm | - |
| `price` | Number | **Có** | Giá sản phẩm (VNĐ) | Phải >= 0 |
| `category_id` | Integer | **Có** | ID của category | Phải tồn tại trong database |
| `description` | String | Không | Mô tả sản phẩm | Mặc định: `''` |
| `quantity` | Integer | Không | Số lượng tồn kho | Mặc định: `0` |
| `image` | String | Không | URL hoặc base64 của hình ảnh | Mặc định: `''` |
| `discount_percent` | Number | Không | Phần trăm giảm giá | 0-100, mặc định: `0` |

**Ví dụ Request:**
```json
POST /api/create-product
Content-Type: application/json

{
  "productName": "Rau cải xanh",
  "price": 25000,
  "category_id": 1,
  "description": "Rau cải xanh tươi ngon",
  "quantity": 100,
  "image": "https://example.com/image.jpg",
  "discount_percent": 10
}
```

**Response Thành công (errCode: 0):**
```json
{
  "errCode": 0,
  "errMessage": "Create product successfully",
  "data": {
    "id": 1,
    "productName": "Rau cải xanh",
    "description": "Rau cải xanh tươi ngon",
    "price": 25000,
    "quantity": 100,
    "sold_quantity": 0,
    "image": "https://example.com/image.jpg",
    "discount_percent": 10,
    "category": "Thực phẩm tươi sống",
    "category_id": 1,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Response Lỗi:**

### 1. Thiếu tham số bắt buộc (errCode: 1)
```json
{
  "errCode": 1,
  "errMessage": "Missing required parameter: productName, price"
}
```

### 2. Giá không hợp lệ (errCode: 1)
```json
{
  "errCode": 1,
  "errMessage": "Invalid price value"
}
```

### 3. Phần trăm giảm giá không hợp lệ (errCode: 1)
```json
{
  "errCode": 1,
  "errMessage": "Invalid discount_percent value. Must be between 0 and 100"
}
```

### 4. Category không tồn tại (errCode: 2)
```json
{
  "errCode": 2,
  "errMessage": "Category not found"
}
```

### 5. Lỗi server (errCode: -1)
```json
{
  "errCode": -1,
  "errMessage": "Error from the server"
}
```

---

## Lưu Ý

- **price**: Phải là số >= 0
- **category_id**: Phải là ID hợp lệ của category đã tồn tại trong database
- **discount_percent**: Chỉ nhận giá trị từ 0 đến 100 (phần trăm)
- **quantity**: Số lượng tồn kho, mặc định là 0
- **sold_quantity**: Tự động tạo với giá trị 0, không cần gửi trong request
- **image**: Có thể là URL hoặc base64 string (hỗ trợ tối đa 50MB)

---

## Ví Dụ Sử Dụng

### cURL
```bash
curl -X POST "https://your-api.com/api/create-product" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "productName": "Rau cải xanh",
    "price": 25000,
    "category_id": 1,
    "description": "Rau cải xanh tươi ngon",
    "quantity": 100,
    "discount_percent": 10
  }'
```

### JavaScript (Fetch API)
```javascript
const createProduct = async (productData) => {
  try {
    const response = await fetch('/api/create-product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
    
    const result = await response.json();
    
    if (result.errCode === 0) {
      console.log('Tạo sản phẩm thành công:', result.data);
    } else {
      console.error('Lỗi:', result.errMessage);
    }
  } catch (error) {
    console.error('Lỗi kết nối:', error);
  }
};

// Sử dụng
createProduct({
  productName: 'Rau cải xanh',
  price: 25000,
  category_id: 1,
  description: 'Rau cải xanh tươi ngon',
  quantity: 100,
  discount_percent: 10
});
```

### Axios
```javascript
const axios = require('axios');

const createProduct = async (productData) => {
  try {
    const response = await axios.post('/api/create-product', productData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.errCode === 0) {
      console.log('Tạo sản phẩm thành công:', response.data.data);
      return response.data.data;
    } else {
      throw new Error(response.data.errMessage);
    }
  } catch (error) {
    console.error('Lỗi:', error.message);
    throw error;
  }
};

// Sử dụng
createProduct({
  productName: 'Rau cải xanh',
  price: 25000,
  category_id: 1
});
```

