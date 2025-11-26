# Hướng Dẫn Shipping Address (Địa Chỉ Giao Hàng)

## Shipping Address là gì?

**Shipping Address** (địa chỉ giao hàng) là thông tin địa chỉ nơi khách hàng muốn nhận hàng. Mỗi đơn hàng cần có một địa chỉ giao hàng để hệ thống biết nơi gửi hàng đến.

### `shipping_address_id` là gì?

`shipping_address_id` là **ID** (số nguyên) của địa chỉ giao hàng đã được lưu trong database. Khi tạo đơn hàng, bạn chỉ cần gửi ID này thay vì gửi toàn bộ thông tin địa chỉ.

---

## Cấu Trúc Địa Chỉ

Một địa chỉ giao hàng bao gồm:

| Field | Type | Required | Description | Example |
|-------|------|-----------|-------------|---------|
| `full_name` | String | ✅ Yes | Tên người nhận | "Nguyễn Văn A" |
| `phone` | String | ✅ Yes | Số điện thoại | "0901234567" |
| `province` | String | ✅ Yes | Tỉnh/Thành phố | "Hồ Chí Minh" |
| `district` | String | ✅ Yes | Quận/Huyện | "Quận 1" |
| `ward` | String | ✅ Yes | Phường/Xã | "Phường Bến Nghé" |
| `detail` | String | ✅ Yes | Địa chỉ chi tiết | "123 Đường Nguyễn Huệ" |
| `is_default` | Boolean | ❌ No | Đặt làm địa chỉ mặc định | `true` hoặc `false` |

---

## API Quản Lý Địa Chỉ

### 1. Tạo Địa Chỉ Mới

**API:** `POST /api/addresses/create`

**Headers:**
```json
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "full_name": "Nguyễn Văn A",
  "phone": "0901234567",
  "province": "Hồ Chí Minh",
  "district": "Quận 1",
  "ward": "Phường Bến Nghé",
  "detail": "123 Đường Nguyễn Huệ, Tầng 5",
  "is_default": true
}
```

**Response:**
```json
{
  "errCode": 0,
  "errMessage": "Address created successfully",
  "data": {
    "id": 1,
    "customer_id": 1,
    "full_name": "Nguyễn Văn A",
    "phone": "0901234567",
    "province": "Hồ Chí Minh",
    "district": "Quận 1",
    "ward": "Phường Bến Nghé",
    "detail": "123 Đường Nguyễn Huệ, Tầng 5",
    "is_default": true,
    "created_at": "2024-01-02T10:00:00.000Z",
    "updated_at": "2024-01-02T10:00:00.000Z"
  }
}
```

**Lưu ý:**
- Nếu `is_default: true`, tất cả địa chỉ khác của user sẽ tự động bỏ default
- `customer_id` được tự động lấy từ user đang đăng nhập

---

### 2. Lấy Danh Sách Địa Chỉ

**API:** `GET /api/addresses`

**Headers:**
```json
{
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

**Response:**
```json
{
  "errCode": 0,
  "errMessage": "Get addresses successfully",
  "data": [
    {
      "id": 1,
      "customer_id": 1,
      "full_name": "Nguyễn Văn A",
      "phone": "0901234567",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường Bến Nghé",
      "detail": "123 Đường Nguyễn Huệ",
      "is_default": true
    },
    {
      "id": 2,
      "customer_id": 1,
      "full_name": "Nguyễn Văn A",
      "phone": "0901234567",
      "province": "Hà Nội",
      "district": "Quận Hoàn Kiếm",
      "ward": "Phường Hàng Bông",
      "detail": "456 Đường Lý Thường Kiệt",
      "is_default": false
    }
  ]
}
```

**Lưu ý:**
- Danh sách được sắp xếp: địa chỉ mặc định trước, sau đó theo thời gian tạo
- Chỉ trả về địa chỉ của user đang đăng nhập

---

### 3. Lấy Địa Chỉ Theo ID

**API:** `GET /api/addresses/:addressId`

**Headers:**
```json
{
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

**Response:**
```json
{
  "errCode": 0,
  "errMessage": "Get address successfully",
  "data": {
    "id": 1,
    "customer_id": 1,
    "full_name": "Nguyễn Văn A",
    "phone": "0901234567",
    "province": "Hồ Chí Minh",
    "district": "Quận 1",
    "ward": "Phường Bến Nghé",
    "detail": "123 Đường Nguyễn Huệ",
    "is_default": true
  }
}
```

---

### 4. Cập Nhật Địa Chỉ

**API:** `PUT /api/addresses/:addressId`

**Headers:**
```json
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "full_name": "Nguyễn Văn B",
  "phone": "0987654321",
  "province": "Hồ Chí Minh",
  "district": "Quận 2",
  "ward": "Phường Thảo Điền",
  "detail": "789 Đường Nguyễn Đình Chiểu",
  "is_default": true
}
```

**Lưu ý:**
- Có thể chỉ cập nhật một số field, không cần gửi tất cả
- Nếu set `is_default: true`, địa chỉ khác sẽ tự động bỏ default

---

### 5. Xóa Địa Chỉ

**API:** `DELETE /api/addresses/:addressId`

**Headers:**
```json
{
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

**Response:**
```json
{
  "errCode": 0,
  "errMessage": "Address deleted successfully"
}
```

---

## Flow Sử Dụng

### Bước 1: Tạo Địa Chỉ (Nếu chưa có)

```javascript
// Tạo địa chỉ mới
POST /api/addresses/create
Headers: { Authorization: Bearer <token> }
Body: {
  full_name: "Nguyễn Văn A",
  phone: "0901234567",
  province: "Hồ Chí Minh",
  district: "Quận 1",
  ward: "Phường Bến Nghé",
  detail: "123 Đường Nguyễn Huệ",
  is_default: true
}

// Response trả về address.id = 1
```

### Bước 2: Sử Dụng shipping_address_id Khi Tạo Đơn Hàng

```javascript
// Tạo đơn hàng với shipping_address_id
POST /api/orders/create
Headers: { Authorization: Bearer <token> }
Body: {
  items: [
    { product_id: 1, quantity: 2 }
  ],
  shipping_address_id: 1  // ID từ bước 1
}
```

---

## Ví Dụ Hoàn Chỉnh

### Frontend Flow:

```javascript
// 1. User đăng nhập
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'password' })
});
const { data: { token } } = await loginResponse.json();

// 2. Lấy danh sách địa chỉ (nếu đã có)
const addressesResponse = await fetch('/api/addresses', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data: addresses } = await addressesResponse.json();

// 3. Nếu chưa có địa chỉ, tạo mới
if (addresses.length === 0) {
  const createAddressResponse = await fetch('/api/addresses/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      full_name: 'Nguyễn Văn A',
      phone: '0901234567',
      province: 'Hồ Chí Minh',
      district: 'Quận 1',
      ward: 'Phường Bến Nghé',
      detail: '123 Đường Nguyễn Huệ',
      is_default: true
    })
  });
  const { data: newAddress } = await createAddressResponse.json();
  addresses.push(newAddress);
}

// 4. Sử dụng địa chỉ để tạo đơn hàng
const shippingAddressId = addresses[0].id; // Lấy địa chỉ đầu tiên (hoặc địa chỉ mặc định)

const createOrderResponse = await fetch('/api/orders/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    items: [
      { product_id: 1, quantity: 2 }
    ],
    shipping_address_id: shippingAddressId
  })
});
```

---

## Error Codes

| errCode | errMessage | Giải pháp |
|---------|------------|-----------|
| 1 | Missing required parameter | Kiểm tra lại body request, đảm bảo đủ các field required |
| 2 | User not authenticated | User chưa đăng nhập hoặc token không hợp lệ |
| 3 | User not found or inactive | User không tồn tại hoặc bị khóa |
| 4 | Address not found | Address ID không tồn tại hoặc không thuộc về user |

---

## Best Practices

1. **Tạo địa chỉ trước khi tạo đơn hàng**: User nên có ít nhất 1 địa chỉ trước khi đặt hàng
2. **Đặt địa chỉ mặc định**: Nên có 1 địa chỉ mặc định để user không cần chọn mỗi lần đặt hàng
3. **Validate địa chỉ**: Frontend nên validate format địa chỉ trước khi gửi lên server
4. **Hiển thị địa chỉ đầy đủ**: Khi hiển thị, nên ghép: `detail, ward, district, province`

---

## Tóm Tắt

- **shipping_address_id**: ID của địa chỉ giao hàng đã lưu trong database
- **Tạo địa chỉ**: `POST /api/addresses/create`
- **Lấy danh sách**: `GET /api/addresses`
- **Sử dụng**: Dùng `address.id` làm `shipping_address_id` khi tạo đơn hàng

