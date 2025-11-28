# Hướng Dẫn API Quản Lý Đơn Hàng

## 1. Lấy Danh Sách Đơn Hàng
**GET** `/api/orders`

**Auth:** Cần token (verifyToken)

**Query Parameters:**
- `status` (optional): Lọc theo trạng thái (`pending`, `paid`, `shipped`, `completed`, `cancelled`)
- `customer_id` (optional): Lọc theo customer ID
- `user_id` (optional): Lọc theo user ID
- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng đơn hàng mỗi trang (mặc định: 10)

**Ví dụ:**
```
GET /api/orders
GET /api/orders?status=completed
GET /api/orders?status=pending&page=1&limit=20
GET /api/orders?customer_id=1
```

**Response:**
```json
{
  "errCode": 0,
  "errMessage": "Get orders successfully",
  "data": {
    "orders": [
      {
        "id": 1,
        "customer_id": 1,
        "user_id": 1,
        "status": "completed",
        "total_amount": 500000,
        "shipping_address_id": 1,
        "created_at": "2025-01-15T10:30:00.000Z",
        "updated_at": "2025-01-15T11:00:00.000Z",
        "customer": {
          "id": 1,
          "full_name": "Nguyễn Văn A",
          "email": "nguyenvana@example.com",
          "phone": "0123456789"
        },
        "shipping_address": {
          "id": 1,
          "full_name": "Nguyễn Văn A",
          "phone": "0123456789",
          "province": "Hồ Chí Minh",
          "district": "Quận 1",
          "ward": "Phường Bến Nghé",
          "detail": "123 Đường ABC"
        },
        "items": [
          {
            "id": 1,
            "order_id": 1,
            "product_id": 1,
            "quantity": 2,
            "unit_price": 250000,
            "product": {
              "id": 1,
              "productName": "Sản phẩm A",
              "price": 250000,
              "image": "base64...",
              "discount_percent": 10
            }
          }
        ]
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

---

## 2. Lấy Chi Tiết Đơn Hàng
**GET** `/api/orders/:orderId`

**Auth:** Cần token (verifyToken)

**Path Parameters:**
- `orderId`: ID của đơn hàng

**Ví dụ:**
```
GET /api/orders/1
```

**Response:**
```json
{
  "errCode": 0,
  "errMessage": "Get order successfully",
  "data": {
    "order": {
      "id": 1,
      "customer_id": 1,
      "user_id": 1,
      "status": "completed",
      "total_amount": 500000,
      "shipping_address_id": 1,
      "created_at": "2025-01-15T10:30:00.000Z",
      "updated_at": "2025-01-15T11:00:00.000Z",
      "customer": {
        "id": 1,
        "full_name": "Nguyễn Văn A",
        "email": "nguyenvana@example.com",
        "phone": "0123456789"
      },
      "user": {
        "id": 1,
        "email": "user@example.com",
        "full_name": "User Name",
        "phone": "0987654321"
      },
      "shipping_address": {
        "id": 1,
        "full_name": "Nguyễn Văn A",
        "phone": "0123456789",
        "province": "Hồ Chí Minh",
        "district": "Quận 1",
        "ward": "Phường Bến Nghé",
        "detail": "123 Đường ABC"
      },
      "items": [
        {
          "id": 1,
          "order_id": 1,
          "product_id": 1,
          "quantity": 2,
          "unit_price": 250000,
          "product": {
            "id": 1,
            "productName": "Sản phẩm A",
            "price": 250000,
            "image": "base64...",
            "discount_percent": 10
          }
        }
      ]
    },
    "payment": {
      "id": 1,
      "orderId": 1,
      "paymentMethod": "paypal",
      "paymentStatus": "paid",
      "paymentDate": "2025-01-15T10:45:00.000Z",
      "totalAmountUSD": 20.00,
      "currency": "USD"
    }
  }
}
```

---

## 3. Cập Nhật Trạng Thái Thanh Toán
**PUT** `/api/orders/:orderId/payment-status`

**Auth:** Cần token (verifyToken)

**Path Parameters:**
- `orderId`: ID của đơn hàng

**Body Parameters:**
- `payment_status` (required): Trạng thái thanh toán mới (`pending`, `paid`, `completed`, `failed`, `cancelled`, `refunded`)

**Lưu ý:**
- Chỉ cập nhật trạng thái thanh toán, không cần thông tin PayPal
- Khi `payment_status` = `paid` hoặc `completed`, sẽ tự động:
  - Cập nhật `paymentDate` nếu chưa có
  - Cập nhật `order.status` thành `paid` nếu order đang ở `pending`

**Ví dụ:**
```json
PUT /api/orders/1/payment-status
Content-Type: application/json

{
  "payment_status": "paid"
}
```

**Response:**
```json
{
  "errCode": 0,
  "errMessage": "Payment status updated successfully",
  "data": {
    "order": {
      "id": 1,
      "customer_id": 1,
      "user_id": 1,
      "status": "paid",
      "order_status": "paid",
      "total_amount": 500000,
      "payment_method": "paypal",
      "payment_status": "paid",
      "payment_date": "2025-01-15T10:45:00.000Z",
      "created_at": "2025-01-15T10:30:00.000Z",
      "updated_at": "2025-01-15T10:45:00.000Z",
      "customer_info": {
        "full_name": "Nguyễn Văn A",
        "phone": "0123456789",
        "email": "nguyenvana@example.com"
      },
      "shipping_address": {...},
      "items": [...]
    },
    "payment": {
      "id": 1,
      "orderId": 1,
      "paymentMethod": "paypal",
      "paymentStatus": "paid",
      "paymentDate": "2025-01-15T10:45:00.000Z"
    },
    "oldPaymentStatus": "pending",
    "newPaymentStatus": "paid"
  }
}
```

**Error Response (Payment record không tồn tại):**
```json
{
  "errCode": 3,
  "errMessage": "Payment record not found for this order"
}
```

**Error Response (Trạng thái không hợp lệ):**
```json
{
  "errCode": 1,
  "errMessage": "Invalid payment_status. Valid statuses: pending, paid, completed, failed, cancelled, refunded"
}
```

---

## 4. Cập Nhật Trạng Thái Đơn Hàng
**PUT** `/api/orders/:orderId/status`

**Auth:** Cần token (verifyToken)

**Path Parameters:**
- `orderId`: ID của đơn hàng

**Body Parameters:**
- `status` (required): Trạng thái mới (`pending`, `paid`, `shipped`, `completed`, `cancelled`)

**Lưu ý:**
- Không thể chuyển từ `completed` hoặc `cancelled` sang trạng thái khác
- Các trạng thái hợp lệ: `pending`, `paid`, `shipped`, `completed`, `cancelled`

**Ví dụ:**
```json
PUT /api/orders/1/status
Content-Type: application/json

{
  "status": "shipped"
}
```

**Response:**
```json
{
  "errCode": 0,
  "errMessage": "Order status updated successfully",
  "data": {
    "order": {
      "id": 1,
      "customer_id": 1,
      "user_id": 1,
      "status": "shipped",
      "total_amount": 500000,
      "shipping_address_id": 1,
      "created_at": "2025-01-15T10:30:00.000Z",
      "updated_at": "2025-01-15T12:00:00.000Z",
      "customer": {
        "id": 1,
        "full_name": "Nguyễn Văn A",
        "email": "nguyenvana@example.com",
        "phone": "0123456789"
      },
      "shipping_address": {
        "id": 1,
        "full_name": "Nguyễn Văn A",
        "phone": "0123456789",
        "province": "Hồ Chí Minh",
        "district": "Quận 1",
        "ward": "Phường Bến Nghé",
        "detail": "123 Đường ABC"
      },
      "items": [
        {
          "id": 1,
          "order_id": 1,
          "product_id": 1,
          "quantity": 2,
          "unit_price": 250000,
          "product": {
            "id": 1,
            "productName": "Sản phẩm A",
            "price": 250000,
            "image": "base64...",
            "discount_percent": 10
          }
        }
      ]
    },
    "oldStatus": "paid",
    "newStatus": "shipped"
  }
}
```

**Error Response (Không thể chuyển trạng thái):**
```json
{
  "errCode": 3,
  "errMessage": "Cannot change status from 'completed' to 'shipped'. Order is already completed."
}
```

**Error Response (Trạng thái không hợp lệ):**
```json
{
  "errCode": 1,
  "errMessage": "Invalid status. Valid statuses: pending, paid, shipped, completed, cancelled"
}
```

---

## Các Trạng Thái Đơn Hàng

1. **pending**: Đơn hàng mới tạo, chưa thanh toán
2. **paid**: Đơn hàng đã thanh toán
3. **shipped**: Đơn hàng đã được vận chuyển
4. **completed**: Đơn hàng đã hoàn thành
5. **cancelled**: Đơn hàng đã bị hủy

## Các Trạng Thái Thanh Toán

1. **pending**: Chờ thanh toán
2. **paid**: Đã thanh toán
3. **completed**: Thanh toán hoàn tất
4. **failed**: Thanh toán thất bại
5. **cancelled**: Thanh toán đã bị hủy
6. **refunded**: Đã hoàn tiền

**Lưu ý:**
- Đơn hàng ở trạng thái `completed` hoặc `cancelled` không thể thay đổi trạng thái
- Quy trình thông thường: `pending` → `paid` → `shipped` → `completed`
- Có thể hủy đơn hàng từ bất kỳ trạng thái nào (trừ `completed` và `cancelled`)

---

## Ví Dụ Sử Dụng

### JavaScript (Fetch API)
```javascript
// Lấy danh sách đơn hàng
const getAllOrders = async (status, page = 1) => {
  try {
    const url = `/api/orders?status=${status}&page=${page}&limit=10`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await response.json();
    console.log('Orders:', result.data.orders);
    console.log('Pagination:', result.data.pagination);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Lấy chi tiết đơn hàng
const getOrderDetail = async (orderId) => {
  try {
    const response = await fetch(`/api/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await response.json();
    console.log('Order:', result.data.order);
    console.log('Payment:', result.data.payment);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    const result = await response.json();
    if (result.errCode === 0) {
      console.log('Status updated:', result.data.newStatus);
      console.log('Order:', result.data.order);
    } else {
      console.error('Error:', result.errMessage);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Axios
```javascript
const axios = require('axios');

// Lấy danh sách đơn hàng
const getAllOrders = async (status, page = 1) => {
  try {
    const response = await axios.get('/api/orders', {
      params: { status, page, limit: 10 },
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Orders:', response.data.data.orders);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

// Cập nhật trạng thái
const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await axios.put(
      `/api/orders/${orderId}/status`,
      { status: newStatus },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    console.log('Updated:', response.data.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};
```

---

## Error Codes

- `0`: Thành công
- `1`: Thiếu tham số hoặc tham số không hợp lệ
- `2`: Không tìm thấy đơn hàng
- `3`: Không thể thay đổi trạng thái (đơn hàng đã completed hoặc cancelled)
- `-1`: Lỗi server

