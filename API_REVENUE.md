# Hướng Dẫn API Revenue (Doanh Thu)

## 1. Doanh Thu Theo Ngày
**GET** `/api/revenue/daily`

**Auth:** Cần token (verifyToken)

**Query Parameters:**
- `date` (optional): Ngày cần xem doanh thu (format: `YYYY-MM-DD`)
  - Nếu không có → mặc định là hôm nay

**Ví dụ:**
```
GET /api/revenue/daily
GET /api/revenue/daily?date=2025-01-15
```

**Response:**
```json
{
  "errCode": 0,
  "errMessage": "Get daily revenue successfully",
  "data": {
    "date": "2025-01-15",
    "revenue": {
      "vnd": 1500000,
      "usd": 60.00,
      "orderCount": 5,
      "paymentCount": 5
    },
    "orders": [
      {
        "id": 1,
        "total_amount": 300000,
        "status": "paid",
        "updated_at": "2025-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

## 2. Doanh Thu Theo Tháng
**GET** `/api/revenue/monthly`

**Auth:** Cần token (verifyToken)

**Query Parameters:**
- `year` (optional): Năm (ví dụ: `2025`)
- `month` (optional): Tháng (1-12)
  - Nếu không có → mặc định là tháng hiện tại

**Ví dụ:**
```
GET /api/revenue/monthly
GET /api/revenue/monthly?year=2025&month=1
```

**Response:**
```json
{
  "errCode": 0,
  "errMessage": "Get monthly revenue successfully",
  "data": {
    "year": 2025,
    "month": 1,
    "revenue": {
      "vnd": 45000000,
      "usd": 1800.00,
      "orderCount": 150,
      "paymentCount": 150
    },
    "dailyBreakdown": [
      {
        "date": "2025-01-01",
        "revenue": 2000000,
        "orderCount": 10
      },
      {
        "date": "2025-01-02",
        "revenue": 1500000,
        "orderCount": 5
      }
    ],
    "orders": [
      {
        "id": 1,
        "total_amount": 300000,
        "status": "paid",
        "updated_at": "2025-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

## 3. Tổng Doanh Thu (Tất Cả Thời Gian)
**GET** `/api/revenue/total`

**Auth:** Cần token (verifyToken)

**Tham số:** Không có

**Response:**
```json
{
  "errCode": 0,
  "errMessage": "Get total revenue successfully",
  "data": {
    "revenue": {
      "vnd": 500000000,
      "usd": 20000.00,
      "orderCount": 2000,
      "paymentCount": 2000
    }
  }
}
```

---

## Lưu Ý

1. **Doanh thu được tính từ:**
   - Orders có status: `paid`, `completed`, `shipped`
   - Dựa vào `updated_at` của order (khi order được cập nhật thành paid)

2. **Đơn vị tiền tệ:**
   - `vnd`: Doanh thu VNĐ (từ `total_amount` của Order)
   - `usd`: Doanh thu USD (từ `totalAmountUSD` của Payment)

3. **Thống kê:**
   - `orderCount`: Số lượng đơn hàng đã thanh toán
   - `paymentCount`: Số lượng payment đã hoàn thành

4. **Monthly breakdown:**
   - `dailyBreakdown`: Doanh thu chi tiết theo từng ngày trong tháng

---

## Ví Dụ Sử Dụng

### JavaScript (Fetch API)
```javascript
// Doanh thu hôm nay
const getTodayRevenue = async () => {
  try {
    const response = await fetch('/api/revenue/daily', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await response.json();
    console.log('Doanh thu hôm nay:', result.data.revenue);
  } catch (error) {
    console.error('Lỗi:', error);
  }
};

// Doanh thu tháng 1/2025
const getMonthlyRevenue = async (year, month) => {
  try {
    const response = await fetch(`/api/revenue/monthly?year=${year}&month=${month}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await response.json();
    console.log('Doanh thu tháng:', result.data.revenue);
    console.log('Chi tiết theo ngày:', result.data.dailyBreakdown);
  } catch (error) {
    console.error('Lỗi:', error);
  }
};
```

### Axios
```javascript
const axios = require('axios');

// Doanh thu theo ngày
const getDailyRevenue = async (date) => {
  try {
    const response = await axios.get('/api/revenue/daily', {
      params: { date: date },
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('Lỗi:', error);
    throw error;
  }
};

// Doanh thu theo tháng
const getMonthlyRevenue = async (year, month) => {
  try {
    const response = await axios.get('/api/revenue/monthly', {
      params: { year, month },
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('Lỗi:', error);
    throw error;
  }
};
```

---

## Cấu Trúc Dữ Liệu

### Revenue Object
```typescript
{
  vnd: number,        // Doanh thu VNĐ
  usd: number,        // Doanh thu USD
  orderCount: number, // Số đơn hàng
  paymentCount: number // Số payment
}
```

### Daily Breakdown (Monthly)
```typescript
{
  date: string,       // YYYY-MM-DD
  revenue: number,    // Doanh thu ngày đó
  orderCount: number  // Số đơn hàng ngày đó
}
```

