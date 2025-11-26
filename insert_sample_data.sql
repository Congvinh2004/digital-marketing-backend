-- ============================================
-- Script chèn dữ liệu mẫu cho hệ thống đi chợ trực tuyến
-- Database: digital-maketing
-- ============================================

USE `digital-maketing`;

-- ============================================
-- XÓA DỮ LIỆU CŨ (Chạy trước khi chèn dữ liệu mới)
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Xóa dữ liệu các bảng con trước (theo thứ tự phụ thuộc)
DELETE FROM `reviews`;
DELETE FROM `cart_items`;
DELETE FROM `carts`;
DELETE FROM `order_items`;
DELETE FROM `order_details`;
DELETE FROM `payment`;
DELETE FROM `shipping`;
DELETE FROM `orders`;
DELETE FROM `addresses`;
DELETE FROM `products`;
DELETE FROM `categories`;
DELETE FROM `customers`;
DELETE FROM `users`;

-- Reset AUTO_INCREMENT về 1
ALTER TABLE `reviews` AUTO_INCREMENT = 1;
ALTER TABLE `cart_items` AUTO_INCREMENT = 1;
ALTER TABLE `carts` AUTO_INCREMENT = 1;
ALTER TABLE `order_items` AUTO_INCREMENT = 1;
ALTER TABLE `order_details` AUTO_INCREMENT = 1;
ALTER TABLE `payment` AUTO_INCREMENT = 1;
ALTER TABLE `shipping` AUTO_INCREMENT = 1;
ALTER TABLE `orders` AUTO_INCREMENT = 1;
ALTER TABLE `addresses` AUTO_INCREMENT = 1;
ALTER TABLE `products` AUTO_INCREMENT = 1;
ALTER TABLE `categories` AUTO_INCREMENT = 1;
ALTER TABLE `customers` AUTO_INCREMENT = 1;
ALTER TABLE `users` AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. CHÈN DỮ LIỆU CHO BẢNG CATEGORIES
-- ============================================

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Thực phẩm tươi sống', 'thuc-pham-tuoi-song', 'Rau củ quả, thịt cá tươi sống, hải sản', 'active', NOW(), NOW()),
(2, 'Đồ uống', 'do-uong', 'Nước ngọt, nước khoáng, bia rượu, nước trái cây', 'active', NOW(), NOW()),
(3, 'Bánh kẹo', 'banh-keo', 'Bánh ngọt, kẹo, snack, bánh quy', 'active', NOW(), NOW()),
(4, 'Gia vị & Đồ khô', 'gia-vi-do-kho', 'Gia vị, mì gói, đồ khô, đậu hạt', 'active', NOW(), NOW()),
(5, 'Sữa & Sản phẩm từ sữa', 'sua-san-pham-tu-sua', 'Sữa tươi, sữa chua, phô mai, bơ', 'active', NOW(), NOW()),
(6, 'Đồ đông lạnh', 'do-dong-lanh', 'Thực phẩm đông lạnh, kem', 'active', NOW(), NOW()),
(7, 'Vệ sinh cá nhân', 've-sinh-ca-nhan', 'Dầu gội, sữa tắm, kem đánh răng', 'active', NOW(), NOW()),
(8, 'Đồ gia dụng', 'do-gia-dung', 'Dụng cụ nhà bếp, đồ dùng gia đình', 'active', NOW(), NOW());

-- ============================================
-- 2. CHÈN DỮ LIỆU CHO BẢNG USERS
-- ============================================

INSERT INTO `users` (`id`, `email`, `password`, `role`, `full_name`, `phone`, `status`, `created_at`, `updated_at`) VALUES
(1, 'admin@dicho.vn', '$2a$10$PZTDiM2B9G/.IYxRH6ILCOe6O/JsK2vQ.blYXu1GG1OhFu8M3VIlK', 'admin', 'Quản trị viên', '0901234567', 'active', NOW(), NOW()),
(2, 'nguyenvana@gmail.com', '$2a$10$5dl0nlyfs29Ma26Ju45YPOly.Z.g4kyOpn.bNUnX2S2QXFtBv5UAG', 'customer', 'Nguyễn Văn A', '0912345678', 'active', NOW(), NOW()),
(3, 'tranthib@gmail.com', '$2a$10$7TwOWyKorSmY0WuWi6FHuOuTHA40Hz8AOMXwYPcRmBkSSIHumITgq', 'customer', 'Trần Thị B', '0923456789', 'active', NOW(), NOW()),
(4, 'lethic@gmail.com', '$2a$10$epua5cKyjfy9.LoUMJcD2O98a1crIaq4wpQjSJgVo3yUPy9UuQrS6', 'customer', 'Lê Thị C', '0934567890', 'active', NOW(), NOW()),
(5, 'phamvand@gmail.com', '$2a$10$PZTDiM2B9G/.IYxRH6ILCOe6O/JsK2vQ.blYXu1GG1OhFu8M3VIlK', 'customer', 'Phạm Văn D', '0945678901', 'active', NOW(), NOW());

-- ============================================
-- 3. CHÈN DỮ LIỆU CHO BẢNG CUSTOMERS
-- ============================================

INSERT INTO `customers` (`id`, `full_name`, `email`, `phone`, `password_hash`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Nguyễn Văn A', 'nguyenvana@gmail.com', '0912345678', '$2a$10$5dl0nlyfs29Ma26Ju45YPOly.Z.g4kyOpn.bNUnX2S2QXFtBv5UAG', 'active', NOW(), NOW()),
(2, 'Trần Thị B', 'tranthib@gmail.com', '0923456789', '$2a$10$7TwOWyKorSmY0WuWi6FHuOuTHA40Hz8AOMXwYPcRmBkSSIHumITgq', 'active', NOW(), NOW()),
(3, 'Lê Thị C', 'lethic@gmail.com', '0934567890', '$2a$10$epua5cKyjfy9.LoUMJcD2O98a1crIaq4wpQjSJgVo3yUPy9UuQrS6', 'active', NOW(), NOW()),
(4, 'Phạm Văn D', 'phamvand@gmail.com', '0945678901', '$2a$10$PZTDiM2B9G/.IYxRH6ILCOe6O/JsK2vQ.blYXu1GG1OhFu8M3VIlK', 'active', NOW(), NOW());

-- ============================================
-- 4. CHÈN DỮ LIỆU CHO BẢNG ADDRESSES
-- ============================================

INSERT INTO `addresses` (`id`, `customer_id`, `full_name`, `phone`, `province`, `district`, `ward`, `detail`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 1, 'Nguyễn Văn A', '0912345678', 'Hà Nội', 'Quận Ba Đình', 'Phường Điện Biên', 'Số 123, Đường Hoàng Diệu', 1, NOW(), NOW()),
(2, 1, 'Nguyễn Văn A', '0912345678', 'Hà Nội', 'Quận Cầu Giấy', 'Phường Dịch Vọng', 'Số 456, Đường Trần Duy Hưng', 0, NOW(), NOW()),
(3, 2, 'Trần Thị B', '0923456789', 'TP. Hồ Chí Minh', 'Quận 1', 'Phường Bến Nghé', 'Số 789, Đường Nguyễn Huệ', 1, NOW(), NOW()),
(4, 3, 'Lê Thị C', '0934567890', 'Đà Nẵng', 'Quận Hải Châu', 'Phường Thạch Thang', 'Số 321, Đường Lê Duẩn', 1, NOW(), NOW()),
(5, 4, 'Phạm Văn D', '0945678901', 'Hải Phòng', 'Quận Ngô Quyền', 'Phường Máy Chai', 'Số 654, Đường Lạch Tray', 1, NOW(), NOW());

-- ============================================
-- 5. CHÈN DỮ LIỆU CHO BẢNG PRODUCTS
-- ============================================

INSERT INTO `products` (`id`, `productName`, `description`, `price`, `quantity`, `category`, `category_id`, `image`, `createdAt`, `updatedAt`) VALUES
-- Thực phẩm tươi sống
(1, 'Rau cải xanh', 'Rau cải xanh tươi ngon, sạch, không thuốc trừ sâu', 25000.00, 100, 'Thực phẩm tươi sống', 1, '/images/rau-cai-xanh.jpg', NOW(), NOW()),
(2, 'Cà chua', 'Cà chua đỏ tươi, ngọt, nhiều vitamin', 35000.00, 80, 'Thực phẩm tươi sống', 1, '/images/ca-chua.jpg', NOW(), NOW()),
(3, 'Thịt heo ba chỉ', 'Thịt heo ba chỉ tươi, thơm ngon', 120000.00, 50, 'Thực phẩm tươi sống', 1, '/images/thit-heo-ba-chi.jpg', NOW(), NOW()),
(4, 'Cá rô phi', 'Cá rô phi tươi sống, thịt chắc ngọt', 85000.00, 60, 'Thực phẩm tươi sống', 1, '/images/ca-ro-phi.jpg', NOW(), NOW()),
(5, 'Tôm sú', 'Tôm sú tươi sống, size lớn', 250000.00, 40, 'Thực phẩm tươi sống', 1, '/images/tom-su.jpg', NOW(), NOW()),

-- Đồ uống
(6, 'Coca Cola 1.5L', 'Nước ngọt Coca Cola chai 1.5 lít', 25000.00, 200, 'Đồ uống', 2, '/images/coca-cola-1.5l.jpg', NOW(), NOW()),
(7, 'Pepsi 330ml', 'Nước ngọt Pepsi lon 330ml', 12000.00, 300, 'Đồ uống', 2, '/images/pepsi-330ml.jpg', NOW(), NOW()),
(8, 'Nước khoáng Lavie 500ml', 'Nước khoáng thiên nhiên Lavie chai 500ml', 8000.00, 500, 'Đồ uống', 2, '/images/lavie-500ml.jpg', NOW(), NOW()),
(9, 'Nước cam ép', 'Nước cam ép tươi 100%, chai 1 lít', 45000.00, 150, 'Đồ uống', 2, '/images/nuoc-cam-ep.jpg', NOW(), NOW()),
(10, 'Bia Tiger 330ml', 'Bia Tiger lon 330ml', 15000.00, 400, 'Đồ uống', 2, '/images/bia-tiger-330ml.jpg', NOW(), NOW()),

-- Bánh kẹo
(11, 'Bánh quy Oreo', 'Bánh quy Oreo hộp 12 cái', 35000.00, 180, 'Bánh kẹo', 3, '/images/oreo.jpg', NOW(), NOW()),
(12, 'Kẹo dẻo Haribo', 'Kẹo dẻo trái cây Haribo túi 200g', 45000.00, 120, 'Bánh kẹo', 3, '/images/haribo.jpg', NOW(), NOW()),
(13, 'Snack Poca', 'Snack Poca vị phô mai gói 60g', 12000.00, 250, 'Bánh kẹo', 3, '/images/poca.jpg', NOW(), NOW()),
(14, 'Bánh Chocopie', 'Bánh Chocopie hộp 12 cái', 55000.00, 100, 'Bánh kẹo', 3, '/images/chocopie.jpg', NOW(), NOW()),
(15, 'Kẹo mút Chupa Chups', 'Kẹo mút Chupa Chups hộp 20 cái', 30000.00, 200, 'Bánh kẹo', 3, '/images/chupa-chups.jpg', NOW(), NOW()),

-- Gia vị & Đồ khô
(16, 'Mì tôm Hảo Hảo', 'Mì tôm Hảo Hảo gói 75g', 5000.00, 500, 'Gia vị & Đồ khô', 4, '/images/mi-hao-hao.jpg', NOW(), NOW()),
(17, 'Nước mắm Phú Quốc', 'Nước mắm Phú Quốc chai 500ml', 45000.00, 150, 'Gia vị & Đồ khô', 4, '/images/nuoc-mam-phu-quoc.jpg', NOW(), NOW()),
(18, 'Đường trắng', 'Đường trắng tinh luyện túi 1kg', 18000.00, 200, 'Gia vị & Đồ khô', 4, '/images/duong-trang.jpg', NOW(), NOW()),
(19, 'Muối i-ốt', 'Muối i-ốt túi 500g', 8000.00, 300, 'Gia vị & Đồ khô', 4, '/images/muoi-iot.jpg', NOW(), NOW()),
(20, 'Bột ngọt Ajinomoto', 'Bột ngọt Ajinomoto gói 454g', 25000.00, 180, 'Gia vị & Đồ khô', 4, '/images/bot-ngot.jpg', NOW(), NOW()),

-- Sữa & Sản phẩm từ sữa
(21, 'Sữa tươi Vinamilk', 'Sữa tươi tiệt trùng Vinamilk hộp 1 lít', 32000.00, 200, 'Sữa & Sản phẩm từ sữa', 5, '/images/sua-tuoi-vinamilk.jpg', NOW(), NOW()),
(22, 'Sữa chua Vinamilk', 'Sữa chua Vinamilk hộp 100g x 4', 28000.00, 250, 'Sữa & Sản phẩm từ sữa', 5, '/images/sua-chua-vinamilk.jpg', NOW(), NOW()),
(23, 'Phô mai Con Bò Cười', 'Phô mai Con Bò Cười hộp 120g', 45000.00, 150, 'Sữa & Sản phẩm từ sữa', 5, '/images/pho-mai-con-bo-cuoi.jpg', NOW(), NOW()),
(24, 'Bơ Anchor', 'Bơ Anchor hộp 250g', 65000.00, 100, 'Sữa & Sản phẩm từ sữa', 5, '/images/bo-anchor.jpg', NOW(), NOW()),
(25, 'Sữa đặc Ông Thọ', 'Sữa đặc có đường Ông Thọ hộp 380g', 22000.00, 180, 'Sữa & Sản phẩm từ sữa', 5, '/images/sua-dac-ong-tho.jpg', NOW(), NOW()),

-- Đồ đông lạnh
(26, 'Chả cá viên', 'Chả cá viên đông lạnh gói 500g', 55000.00, 120, 'Đồ đông lạnh', 6, '/images/cha-ca-vien.jpg', NOW(), NOW()),
(27, 'Cá viên', 'Cá viên đông lạnh gói 500g', 45000.00, 150, 'Đồ đông lạnh', 6, '/images/ca-vien.jpg', NOW(), NOW()),
(28, 'Kem Wall''s', 'Kem Wall''s hộp 1 lít', 85000.00, 80, 'Đồ đông lạnh', 6, '/images/kem-walls.jpg', NOW(), NOW()),
(29, 'Tôm đông lạnh', 'Tôm đông lạnh gói 500g', 120000.00, 100, 'Đồ đông lạnh', 6, '/images/tom-dong-lanh.jpg', NOW(), NOW()),
(30, 'Cá basa phi lê', 'Cá basa phi lê đông lạnh gói 500g', 75000.00, 90, 'Đồ đông lạnh', 6, '/images/ca-basa.jpg', NOW(), NOW()),

-- Vệ sinh cá nhân
(31, 'Dầu gội Clear', 'Dầu gội Clear chai 400ml', 85000.00, 150, 'Vệ sinh cá nhân', 7, '/images/dau-goi-clear.jpg', NOW(), NOW()),
(32, 'Sữa tắm Lifebuoy', 'Sữa tắm Lifebuoy chai 750ml', 65000.00, 120, 'Vệ sinh cá nhân', 7, '/images/sua-tam-lifebuoy.jpg', NOW(), NOW()),
(33, 'Kem đánh răng P/S', 'Kem đánh răng P/S tuýp 150g', 35000.00, 200, 'Vệ sinh cá nhân', 7, '/images/kem-danh-rang-ps.jpg', NOW(), NOW()),
(34, 'Bàn chải đánh răng', 'Bàn chải đánh răng Colgate', 25000.00, 180, 'Vệ sinh cá nhân', 7, '/images/ban-chai-danh-rang.jpg', NOW(), NOW()),
(35, 'Khăn giấy', 'Khăn giấy ướt hộp 80 tờ', 45000.00, 160, 'Vệ sinh cá nhân', 7, '/images/khan-giay.jpg', NOW(), NOW()),

-- Đồ gia dụng
(36, 'Chén sứ', 'Bộ chén sứ 6 cái', 120000.00, 80, 'Đồ gia dụng', 8, '/images/chen-su.jpg', NOW(), NOW()),
(37, 'Đũa tre', 'Bộ đũa tre 10 đôi', 35000.00, 150, 'Đồ gia dụng', 8, '/images/dua-tre.jpg', NOW(), NOW()),
(38, 'Thìa inox', 'Bộ thìa inox 6 cái', 55000.00, 100, 'Đồ gia dụng', 8, '/images/thia-inox.jpg', NOW(), NOW()),
(39, 'Nồi cơm điện', 'Nồi cơm điện Sunhouse 1.8 lít', 650000.00, 30, 'Đồ gia dụng', 8, '/images/noi-com-dien.jpg', NOW(), NOW()),
(40, 'Bình giữ nhiệt', 'Bình giữ nhiệt Lock&Lock 500ml', 180000.00, 60, 'Đồ gia dụng', 8, '/images/binh-giu-nhiet.jpg', NOW(), NOW());

-- ============================================
-- 6. CHÈN DỮ LIỆU CHO BẢNG CARTS
-- ============================================

INSERT INTO `carts` (`id`, `userId`, `createdAt`, `updatedAt`) VALUES
(1, 2, NOW(), NOW()),
(2, 3, NOW(), NOW()),
(3, 4, NOW(), NOW());

-- ============================================
-- 7. CHÈN DỮ LIỆU CHO BẢNG CART_ITEMS
-- ============================================

INSERT INTO `cart_items` (`id`, `productId`, `cartId`, `quantity`, `createdAt`, `updatedAt`) VALUES
(1, 1, 1, 2, NOW(), NOW()),
(2, 6, 1, 3, NOW(), NOW()),
(3, 11, 1, 1, NOW(), NOW()),
(4, 21, 2, 2, NOW(), NOW()),
(5, 16, 2, 5, NOW(), NOW()),
(6, 31, 3, 1, NOW(), NOW()),
(7, 33, 3, 2, NOW(), NOW());

-- ============================================
-- 8. CHÈN DỮ LIỆU CHO BẢNG ORDERS
-- ============================================

INSERT INTO `orders` (`id`, `customer_id`, `status`, `total_amount`, `shipping_address_id`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 1, 'completed', 125000.00, 1, 2, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, 2, 'shipped', 185000.00, 3, 3, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 3, 'paid', 95000.00, 4, 4, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 1, 'pending', 145000.00, 1, 2, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(5, 4, 'completed', 320000.00, 5, 5, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY));

-- ============================================
-- 9. CHÈN DỮ LIỆU CHO BẢNG ORDER_ITEMS
-- ============================================

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `unit_price`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 2, 25000.00, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 1, 6, 3, 25000.00, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(3, 2, 3, 1, 120000.00, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4, 2, 8, 5, 8000.00, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(5, 2, 11, 1, 35000.00, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(6, 3, 16, 10, 5000.00, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(7, 3, 18, 2, 18000.00, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(8, 3, 19, 1, 8000.00, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(9, 4, 21, 2, 32000.00, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(10, 4, 22, 2, 28000.00, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(11, 4, 23, 1, 45000.00, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(12, 5, 5, 1, 250000.00, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),
(13, 5, 9, 1, 45000.00, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),
(14, 5, 25, 1, 22000.00, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY));

-- ============================================
-- 10. CHÈN DỮ LIỆU CHO BẢNG ORDER_DETAILS
-- ============================================

INSERT INTO `order_details` (`id`, `orderId`, `productId`, `quantity`, `price`, `createdAt`, `updatedAt`) VALUES
(1, 1, 1, 2, 25000.00, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 1, 6, 3, 25000.00, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(3, 2, 3, 1, 120000.00, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4, 2, 8, 5, 8000.00, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(5, 3, 16, 10, 5000.00, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY));

-- ============================================
-- 11. CHÈN DỮ LIỆU CHO BẢNG PAYMENT
-- ============================================

INSERT INTO `payment` (`id`, `orderId`, `paymentMethod`, `paymentStatus`, `paymentDate`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'COD', 'paid', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, 2, 'Bank Transfer', 'paid', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 3, 'Credit Card', 'paid', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 4, 'COD', 'pending', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(5, 5, 'Bank Transfer', 'paid', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY));

-- ============================================
-- 12. CHÈN DỮ LIỆU CHO BẢNG SHIPPING
-- ============================================

INSERT INTO `shipping` (`id`, `orderId`, `shippingAddress`, `shippingStatus`, `shippingDate`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'Số 123, Đường Hoàng Diệu, Phường Điện Biên, Quận Ba Đình, Hà Nội', 'delivered', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, 2, 'Số 789, Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', 'in_transit', NULL, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 3, 'Số 321, Đường Lê Duẩn, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng', 'preparing', NULL, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 4, 'Số 123, Đường Hoàng Diệu, Phường Điện Biên, Quận Ba Đình, Hà Nội', 'pending', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(5, 5, 'Số 654, Đường Lạch Tray, Phường Máy Chai, Quận Ngô Quyền, Hải Phòng', 'delivered', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY));

-- ============================================
-- 13. CHÈN DỮ LIỆU CHO BẢNG REVIEWS
-- ============================================

INSERT INTO `reviews` (`id`, `userId`, `productId`, `rating`, `comment`, `createdAt`, `updatedAt`) VALUES
(1, 2, 1, 5, 'Rau rất tươi, đóng gói cẩn thận, giao hàng nhanh', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, 2, 6, 4, 'Sản phẩm tốt, giá hợp lý', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(3, 3, 3, 5, 'Thịt tươi ngon, chất lượng tốt', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 3, 8, 5, 'Nước khoáng chất lượng, đóng gói tốt', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(5, 4, 5, 4, 'Tôm tươi, size đúng như mô tả', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
(6, 4, 9, 5, 'Nước cam ép ngon, đậm đà', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
(7, 2, 11, 4, 'Bánh quy ngon, giòn', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(8, 3, 16, 5, 'Mì tôm ngon, giá rẻ', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(9, 4, 21, 5, 'Sữa tươi thơm ngon, chất lượng', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(10, 2, 31, 4, 'Dầu gội tốt, mùi thơm dễ chịu', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY));

-- ============================================
-- HOÀN TẤT
-- ============================================

SELECT '✅ Đã chèn dữ liệu mẫu thành công!' AS Status;

-- Kiểm tra số lượng dữ liệu đã chèn
SELECT 
    'categories' AS TableName, COUNT(*) AS Count FROM categories
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'addresses', COUNT(*) FROM addresses
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'carts', COUNT(*) FROM carts
UNION ALL
SELECT 'cart_items', COUNT(*) FROM cart_items
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'order_details', COUNT(*) FROM order_details
UNION ALL
SELECT 'payment', COUNT(*) FROM payment
UNION ALL
SELECT 'shipping', COUNT(*) FROM shipping
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews;

