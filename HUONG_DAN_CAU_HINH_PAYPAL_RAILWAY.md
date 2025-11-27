# Hướng Dẫn Cấu Hình PayPal trên Railway

## Vấn Đề
Lỗi: `"error":"invalid_client","error_description":"Client Authentication failed"`

Nguyên nhân: PayPal Client ID hoặc Client Secret không đúng hoặc chưa được cấu hình trên Railway.

---

## Cách Khắc Phục

### Bước 1: Lấy PayPal Credentials

#### Nếu dùng Sandbox (Testing):
1. Truy cập: https://developer.paypal.com/
2. Đăng nhập với tài khoản PayPal
3. Vào **Dashboard** → **My Apps & Credentials**
4. Chọn **Sandbox** tab
5. Tạo app mới hoặc sử dụng app có sẵn
6. Copy **Client ID** và **Secret**

#### Nếu dùng Live (Production):
1. Truy cập: https://developer.paypal.com/
2. Đăng nhập với tài khoản PayPal
3. Vào **Dashboard** → **My Apps & Credentials**
4. Chọn **Live** tab
5. Tạo app mới hoặc sử dụng app có sẵn
6. Copy **Client ID** và **Secret**

---

### Bước 2: Cấu Hình trên Railway

1. Vào project trên Railway: https://railway.app/
2. Chọn service của bạn
3. Vào tab **Variables**
4. Thêm các biến môi trường sau:

#### Nếu dùng Sandbox (Development/Testing):
```
PAYPAL_CLIENT_ID=your-sandbox-client-id-here
PAYPAL_CLIENT_SECRET=your-sandbox-secret-here
NODE_ENV=development
```

#### Nếu dùng Live (Production):
```
PAYPAL_CLIENT_ID=your-live-client-id-here
PAYPAL_CLIENT_SECRET=your-live-secret-here
NODE_ENV=production
```

**Lưu ý quan trọng:**
- Nếu `NODE_ENV=production` → Code sẽ dùng **LiveEnvironment** (cần Live credentials)
- Nếu `NODE_ENV=development` hoặc không set → Code sẽ dùng **SandboxEnvironment** (cần Sandbox credentials)
- **KHÔNG BAO GIỜ** dùng Sandbox credentials với `NODE_ENV=production` hoặc ngược lại!

---

### Bước 3: Cấu Hình Return URLs (Optional)

Thêm các biến này nếu muốn custom return URLs:

```
PAYPAL_RETURN_URL=https://your-frontend-domain.com/payment/success
PAYPAL_CANCEL_URL=https://your-frontend-domain.com/payment/cancel
```

Nếu không set, sẽ dùng mặc định:
- Return: `http://localhost:3000/payment/success`
- Cancel: `http://localhost:3000/payment/cancel`

---

### Bước 4: Redeploy

Sau khi thêm environment variables:
1. Railway sẽ tự động redeploy
2. Hoặc click **Deploy** để redeploy thủ công
3. Kiểm tra logs để xem có lỗi không

---

## Kiểm Tra Cấu Hình

### Cách 1: Kiểm tra trong Railway Logs
Sau khi deploy, xem logs. Nếu thấy lỗi:
- `PayPal credentials not configured` → Chưa set environment variables
- `invalid_client` → Credentials sai hoặc không khớp với NODE_ENV

### Cách 2: Test API
Gọi API create order và kiểm tra response:
- Nếu thành công → Cấu hình đúng
- Nếu lỗi 401 → Credentials sai

---

## Ví Dụ Cấu Hình Đúng

### Scenario 1: Development/Testing với Sandbox
```
NODE_ENV=development
PAYPAL_CLIENT_ID=AeA1QIZXiflr1_-... (Sandbox Client ID)
PAYPAL_CLIENT_SECRET=EL92t6-... (Sandbox Secret)
```

### Scenario 2: Production với Live
```
NODE_ENV=production
PAYPAL_CLIENT_ID=AXyB2RJYiflr2_-... (Live Client ID)
PAYPAL_CLIENT_SECRET=FL03u7-... (Live Secret)
```

---

## Lưu Ý Quan Trọng

1. **KHÔNG BAO GIỜ** commit credentials vào Git
2. **KHÔNG BAO GIỜ** dùng Live credentials trong môi trường development
3. **LUÔN** kiểm tra `NODE_ENV` khớp với loại credentials (Sandbox/Live)
4. Sandbox credentials chỉ dùng để test, không thể nhận tiền thật
5. Live credentials dùng để nhận tiền thật, cần bảo mật cao

---

## Troubleshooting

### Lỗi: "Client Authentication failed"
- ✅ Kiểm tra Client ID và Secret đã được set chưa
- ✅ Kiểm tra Client ID và Secret có đúng không (copy đầy đủ, không có khoảng trắng)
- ✅ Kiểm tra NODE_ENV khớp với loại credentials (Sandbox/Live)

### Lỗi: "PayPal credentials not configured"
- ✅ Thêm PAYPAL_CLIENT_ID và PAYPAL_CLIENT_SECRET vào Railway Variables
- ✅ Redeploy service

### Lỗi: "PayPal SDK not installed"
- ✅ Chạy: `npm install @paypal/checkout-server-sdk`
- ✅ Kiểm tra package.json có dependency này

---

## Liên Kết Hữu Ích

- PayPal Developer Dashboard: https://developer.paypal.com/
- PayPal API Documentation: https://developer.paypal.com/docs/api/overview/
- Railway Documentation: https://docs.railway.app/

