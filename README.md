# Ứng dụng quản lý nhà hàng – kiến trúc Microservices

## Mô tả
Đây là hệ thống web quản lý nhà hàng – khách sạn được thiết kế theo mô hình Microservice kết hợp với kiến trúc MVC, sử dụng MERN stack nhằm hỗ trợ quy trình đặt bàn, phục vụ món ăn và quản lý vận hành nhà hàng một cách linh hoạt và mở rộng dễ dàng.

## Cấu trúc thư mục

```
Restaurant-Management/
│
├── backend/
│   ├── api-gateway/
│   ├── user-service/
│   ├── reservation-service/
│   ├── food-service/
│   ├── order-service/
│   ├── table-service/
│   └── payment-service/
├── customer_frontend/
├── frontend/
│
├── docker-compose.yml
└── README.md
```

- **backend/**: Chứa toàn bộ mã nguồn backend (các microservice và API Gateway)
- **frontend/**: Ứng dụng React giao diện người dùng
  - `frontend/`: Ứng dụng React cho nhân viên (staff)
  - `customer_frontend/`: Ứng dụng React cho khách hàng (customer)
- **docker-compose.yml**: Quản lý các container

## Các service backend & cổng sử dụng

1. **User Service** (port **3001**)
   - Chức năng: Quản lý nhân sự
   - Bảng dữ liệu: `User`
2. **Reservation Service** (port **3002**)
   - Chức năng: Quản lý đặt bàn, khách hàng, và lịch sử sử dụng bàn
   - Bảng dữ liệu: `Reservation`, `Customer`
3. **Food Service** (port **3003**)
   - Chức năng: Quản lý thực đơn
   - Bảng dữ liệu: `Food`, `Category`
4. **Order Service** (port **3004**)
   - Chức năng: Quản lý đơn hàng, gọi món theo từng bàn
   - Bảng dữ liệu: `Order`, `OrderItems`
5. **Table Service** (port **3005**)
   - Chức năng: Quản lý thông tin các bàn trong nhà hàng
   - Bảng dữ liệu: `Table`
6. **Payment Service** (port **3006**)
   - Chức năng: Quản lý thanh toán
   - Bảng dữ liệu: `Payment`
7. **api-gateway**: Định tuyến request giữa frontend và các service (**cổng 3000**)
8. **frontend**: Giao diện người dùng (**cổng 4000**)
9. **customer_frontend**: Giao diện khách hàng (**cổng 5173**)

## Hướng dẫn khởi chạy

### 1. Clone dự án
```bash
git clone <link-repo>
cd Restaurant-Management
```

### 2. Cài đặt package chung (nếu có)
```bash
npm init -y
npm install
```

### 3. Cài đặt và cấu hình từng service
- Vào thư mục service bạn phụ trách, ví dụ:
  ```bash
  cd backend/user-service
  npm install
  cp .env.example .env # hoặc tự tạo file .env theo mẫu
  # Chỉnh sửa các biến môi trường nếu cần
  ```
- Làm tương tự với các service khác: reservation-service, food-service, order-service, table-service, payment-service, api-gateway

### 4. Chạy service ở chế độ dev
```bash
npm run dev
```

### 5. (Tùy chọn) Chạy toàn bộ hệ thống bằng Docker Compose (bao gồm 2 frontend)
- Ở thư mục gốc dự án:
  ```bash
  docker-compose up --build
  ```
- Docker sẽ tự động build và chạy tất cả các service, MongoDB và frontend.

#### Truy cập 2 ứng dụng frontend
- Staff frontend (nhân viên): `http://localhost:4000`
- Customer frontend (khách hàng): `http://localhost:5173`

### 6. Truy cập các service
- User Service: http://localhost:3001
- Reservation Service: http://localhost:3002
- Food Service: http://localhost:3003
- Order Service: http://localhost:3004
- Table Service: http://localhost:3005
- Payment Service: http://localhost:3006
- API Gateway: http://localhost:3000
- Staff Frontend: http://localhost:4000
- Customer Frontend: http://localhost:5173

> **Lưu ý:**
> - Đảm bảo port trên máy bạn không bị chiếm trước khi chạy.
> - Nếu có lỗi port, hãy kiểm tra và kill tiến trình chiếm port đó.
> - Mỗi service cần file `.env` riêng, tham khảo mẫu trong từng thư mục service.
