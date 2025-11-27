# Hướng Dẫn API Update User

## Thông Tin Tổng Quan

**Endpoint:** `PUT /api/update-user`

**Mô tả:** API này cho phép cập nhật thông tin của một user trong hệ thống.

**Yêu cầu xác thực:** Có (cần token xác thực trong header)

---

## Tham Số

### 1. Query Parameters (URL)

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
|---------|--------------|----------|-------|
| `id` | Integer | **Có** | ID của user cần cập nhật |

**Ví dụ:**
```
PUT /api/update-user?id=1
```

---

### 2. Request Body (JSON)

Tất cả các tham số trong body đều là **tùy chọn**. Chỉ cần gửi các trường muốn cập nhật.

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả | Ràng buộc |
|---------|--------------|----------|-------|-----------|
| `email` | String | Không | Email của user | - Phải là email hợp lệ<br>- Phải là duy nhất trong hệ thống<br>- Tối đa 180 ký tự |
| `password` | String | Không | Mật khẩu mới | - Sẽ được hash tự động<br>- Không hiển thị trong response |
| `full_name` | String | Không | Họ và tên đầy đủ | - Tối đa 150 ký tự<br>- Có thể để trống (null) |
| `phone` | String | Không | Số điện thoại | - Tối đa 30 ký tự<br>- Có thể để trống (null) |
| `role` | Enum | Không | Vai trò của user | - Chỉ nhận giá trị: `'customer'` hoặc `'admin'`<br>- Mặc định: `'customer'` |
| `status` | Enum | Không | Trạng thái của user | - Chỉ nhận giá trị: `'active'` hoặc `'inactive'`<br>- Mặc định: `'active'` |

---

## Ví Dụ Request

### Ví dụ 1: Cập nhật email và tên đầy đủ

```json
PUT /api/update-user?id=1
Content-Type: application/json
Authorization: Bearer <your_token>

{
  "email": "newemail@example.com",
  "full_name": "Nguyễn Văn B"
}
```

### Ví dụ 2: Cập nhật mật khẩu

```json
PUT /api/update-user?id=1
Content-Type: application/json
Authorization: Bearer <your_token>

{
  "password": "newPassword123"
}
```

### Ví dụ 3: Cập nhật nhiều trường

```json
PUT /api/update-user?id=1
Content-Type: application/json
Authorization: Bearer <your_token>

{
  "full_name": "Trần Thị C",
  "phone": "0912345678",
  "status": "active"
}
```

### Ví dụ 4: Cập nhật role

```json
PUT /api/update-user?id=1
Content-Type: application/json
Authorization: Bearer <your_token>

{
  "role": "admin"
}
```

---

## Response

### Thành công (errCode: 0)

**Status Code:** `200 OK`

```json
{
  "errCode": 0,
  "errMessage": "Update user successfully",
  "data": {
    "id": 1,
    "email": "newemail@example.com",
    "full_name": "Nguyễn Văn B",
    "phone": "0912345678",
    "role": "customer",
    "status": "active"
  }
}
```

**Lưu ý:** Trường `password` không được trả về trong response vì lý do bảo mật.

---

### Lỗi

#### 1. Thiếu tham số id (errCode: 1)

**Status Code:** `200 OK`

```json
{
  "errCode": 1,
  "errMessage": "Missing required parameter: id"
}
```

#### 2. User không tồn tại (errCode: 2)

**Status Code:** `200 OK`

```json
{
  "errCode": 2,
  "errMessage": "User not found"
}
```

#### 3. Email đã tồn tại (errCode: 2)

**Status Code:** `200 OK`

```json
{
  "errCode": 2,
  "errMessage": "Email already exists"
}
```

**Lưu ý:** Lỗi này chỉ xảy ra khi bạn cố gắng đổi email sang một email đã được sử dụng bởi user khác.

#### 4. Lỗi server (errCode: -1)

**Status Code:** `200 OK`

```json
{
  "errCode": -1,
  "errMessage": "Error from the server"
}
```

---

## Lưu Ý Quan Trọng

1. **Xác thực:** API này yêu cầu token xác thực. Đảm bảo gửi token trong header:
   ```
   Authorization: Bearer <your_token>
   ```

2. **Email duy nhất:** Nếu cập nhật email, email mới phải chưa được sử dụng bởi user khác.

3. **Mật khẩu:** Khi cập nhật mật khẩu, mật khẩu sẽ được hash tự động. Mật khẩu gốc không được lưu trữ.

4. **Cập nhật một phần:** Bạn chỉ cần gửi các trường muốn cập nhật. Các trường không gửi sẽ giữ nguyên giá trị cũ.

5. **full_name và phone:** Có thể gửi giá trị `null` hoặc chuỗi rỗng để xóa dữ liệu.

6. **Role và Status:** Chỉ chấp nhận các giá trị enum đã định nghĩa. Gửi giá trị khác có thể gây lỗi.

---

## Cấu Trúc Dữ Liệu User

Dựa trên model User trong database:

```javascript
{
  id: Integer (auto increment),
  email: String(180) - unique, required,
  password: String(255) - required (hashed),
  full_name: String(150) - optional,
  phone: String(30) - optional,
  role: Enum('customer', 'admin') - default: 'customer',
  status: Enum('active', 'inactive') - default: 'active',
  created_at: DateTime,
  updated_at: DateTime
}
```

---

## Ví Dụ Sử Dụng với cURL

```bash
# Cập nhật email và tên
curl -X PUT "http://localhost:3000/api/update-user?id=1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "email": "newemail@example.com",
    "full_name": "Nguyễn Văn B"
  }'

# Cập nhật mật khẩu
curl -X PUT "http://localhost:3000/api/update-user?id=1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "password": "newPassword123"
  }'
```

---

## Ví Dụ Sử Dụng với JavaScript (Fetch API)

```javascript
const updateUser = async (userId, userData) => {
  try {
    const response = await fetch(`/api/update-user?id=${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${yourToken}`
      },
      body: JSON.stringify(userData)
    });
    
    const result = await response.json();
    
    if (result.errCode === 0) {
      console.log('Cập nhật thành công:', result.data);
    } else {
      console.error('Lỗi:', result.errMessage);
    }
  } catch (error) {
    console.error('Lỗi kết nối:', error);
  }
};

// Sử dụng
updateUser(1, {
  email: 'newemail@example.com',
  full_name: 'Nguyễn Văn B'
});
```

---

## Ví Dụ Sử Dụng với Axios

```javascript
const axios = require('axios');

const updateUser = async (userId, userData) => {
  try {
    const response = await axios.put(`/api/update-user?id=${userId}`, userData, {
      headers: {
        'Authorization': `Bearer ${yourToken}`
      }
    });
    
    if (response.data.errCode === 0) {
      console.log('Cập nhật thành công:', response.data.data);
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
updateUser(1, {
  full_name: 'Trần Thị C',
  phone: '0912345678',
  status: 'active'
});
```

---

*Tài liệu này được tạo tự động dựa trên code hiện tại của hệ thống.*


