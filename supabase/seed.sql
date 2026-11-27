-- =====================================================================
-- BrickVerse — dữ liệu mẫu (sinh tự động bởi scripts/generate-seed.mts)
-- Chạy SAU 001_init.sql. Ảnh mẫu là placeholder SVG trong /public/placeholders.
-- =====================================================================

insert into public.categories (id, name, slug) values
  ('11111111-1111-4111-8111-000000000001', 'Xe & Cơ khí', 'xe-co-khi'),
  ('11111111-1111-4111-8111-000000000002', 'Thành phố', 'thanh-pho'),
  ('11111111-1111-4111-8111-000000000003', 'Không gian', 'khong-gian'),
  ('11111111-1111-4111-8111-000000000004', 'Kiến trúc', 'kien-truc'),
  ('11111111-1111-4111-8111-000000000005', 'Sáng tạo', 'sang-tao')
on conflict (slug) do nothing;

insert into public.products
  (id, name, slug, set_number, category_id, theme, price, sale_price, stock, pieces, age_range, release_year,
   short_description, description, images, thumbnail, is_featured, is_published, created_at)
values
  ('22222222-2222-4222-8222-000000000001', 'Siêu xe thể thao V12', 'sieu-xe-the-thao-v12', '42901',
   (select id from public.categories where slug = 'xe-co-khi'), 'Technic',
   8990000, 7490000, 6, 3778, '18+', 2025,
   'Mô hình siêu xe tỉ lệ 1:8 với hộp số 8 cấp và động cơ V12 chuyển động thật.',
   '## Kiệt tác cơ khí tỉ lệ 1:8

Lắp ráp từng chi tiết của một chiếc siêu xe với hệ thống treo độc lập, hộp số tuần tự và cánh gió chủ động.

### Điểm nổi bật

- Động cơ V12 với piston chuyển động
- Hộp số 8 cấp có lẫy chuyển số
- Cửa cánh chim mở được
- Kích thước hoàn thiện 60 × 25 × 15 cm

> Sản phẩm mới 100%, nguyên seal. Hỗ trợ kiểm tra hàng khi nhận.',
   array['/placeholders/sieu-xe-the-thao-v12-1.svg', '/placeholders/sieu-xe-the-thao-v12-2.svg']::text[], '/placeholders/sieu-xe-the-thao-v12-1.svg', true, true, '2025-10-02T08:00:00Z'),
  ('22222222-2222-4222-8222-000000000002', 'Máy xúc địa hình điều khiển', 'may-xuc-dia-hinh-dieu-khien', '42912',
   (select id from public.categories where slug = 'xe-co-khi'), 'Technic',
   5490000, null, 12, 2140, '12+', 2024,
   'Máy xúc bánh xích điều khiển qua ứng dụng, cần gạt và gầu xúc vận hành bằng motor.',
   '## Công trường thu nhỏ

Điều khiển máy xúc qua điện thoại với 3 motor và hub thông minh.

### Điểm nổi bật

- Bánh xích chạy địa hình
- Cần và gầu xúc vận hành bằng motor
- Kết nối Bluetooth

> Sản phẩm mới 100%, nguyên seal. Hỗ trợ kiểm tra hàng khi nhận.',
   array['/placeholders/may-xuc-dia-hinh-dieu-khien-1.svg', '/placeholders/may-xuc-dia-hinh-dieu-khien-2.svg']::text[], '/placeholders/may-xuc-dia-hinh-dieu-khien-1.svg', false, true, '2025-06-12T08:00:00Z'),
  ('22222222-2222-4222-8222-000000000003', 'Trạm cứu hỏa trung tâm', 'tram-cuu-hoa-trung-tam', '60420',
   (select id from public.categories where slug = 'thanh-pho'), 'City',
   2690000, 2290000, 18, 843, '6+', 2025,
   'Trạm cứu hỏa 3 tầng kèm xe thang, trực thăng mini và 6 nhân vật.',
   '## Sẵn sàng làm nhiệm vụ

Trạm cứu hỏa nhiều tầng với cửa cuốn, cột trượt và phòng chỉ huy.

### Điểm nổi bật

- Xe thang mở rộng được
- Trực thăng mini
- 6 nhân vật kèm phụ kiện

> Sản phẩm mới 100%, nguyên seal. Hỗ trợ kiểm tra hàng khi nhận.',
   array['/placeholders/tram-cuu-hoa-trung-tam-1.svg', '/placeholders/tram-cuu-hoa-trung-tam-2.svg']::text[], '/placeholders/tram-cuu-hoa-trung-tam-1.svg', true, true, '2025-09-20T08:00:00Z'),
  ('22222222-2222-4222-8222-000000000004', 'Tàu điện ngoại ô', 'tau-dien-ngoai-o', '60437',
   (select id from public.categories where slug = 'thanh-pho'), 'City',
   3290000, null, 0, 764, '7+', 2024,
   'Đoàn tàu chạy pin với 16 đoạn ray, nhà ga và điều khiển từ xa.',
   '## Lên tàu thôi!

Đoàn tàu 2 toa chạy motor, kèm nhà ga và barie.

### Điểm nổi bật

- 16 đoạn ray cong và thẳng
- Điều khiển tốc độ
- Đèn pha phát sáng

> Sản phẩm mới 100%, nguyên seal. Hỗ trợ kiểm tra hàng khi nhận.',
   array['/placeholders/tau-dien-ngoai-o-1.svg', '/placeholders/tau-dien-ngoai-o-2.svg']::text[], '/placeholders/tau-dien-ngoai-o-1.svg', false, true, '2025-03-08T08:00:00Z'),
  ('22222222-2222-4222-8222-000000000005', 'Chiến hạm tinh vân', 'chien-ham-tinh-van', '75390',
   (select id from public.categories where slug = 'khong-gian'), 'Star Wars',
   4890000, 4190000, 4, 1351, '10+', 2025,
   'Chiến hạm vũ trụ với buồng lái mở được, súng bắn đạn và 5 nhân vật.',
   '## Chiến binh giữa các vì sao

Chiến hạm hạng nặng có khoang chở hàng, tháp pháo xoay và cánh gập.

### Điểm nổi bật

- Tháp pháo xoay 360°
- Khoang chở hàng mở được
- 5 nhân vật

> Sản phẩm mới 100%, nguyên seal. Hỗ trợ kiểm tra hàng khi nhận.',
   array['/placeholders/chien-ham-tinh-van-1.svg', '/placeholders/chien-ham-tinh-van-2.svg']::text[], '/placeholders/chien-ham-tinh-van-1.svg', true, true, '2025-08-15T08:00:00Z'),
  ('22222222-2222-4222-8222-000000000006', 'Phi thuyền đánh chặn X', 'phi-thuyen-danh-chan-x', '75402',
   (select id from public.categories where slug = 'khong-gian'), 'Star Wars',
   1890000, null, 25, 474, '9+', 2024,
   'Phi thuyền chiến đấu cánh chữ X, cánh mở được và bộ đế trưng bày.',
   '## Tốc độ ánh sáng

Phi thuyền chiến đấu nhỏ gọn, cánh mở chế độ tấn công.

### Điểm nổi bật

- Cánh mở bằng núm xoay
- Đế trưng bày nghiêng
- 2 nhân vật

> Sản phẩm mới 100%, nguyên seal. Hỗ trợ kiểm tra hàng khi nhận.',
   array['/placeholders/phi-thuyen-danh-chan-x-1.svg', '/placeholders/phi-thuyen-danh-chan-x-2.svg']::text[], '/placeholders/phi-thuyen-danh-chan-x-1.svg', false, true, '2025-01-22T08:00:00Z'),
  ('22222222-2222-4222-8222-000000000007', 'Ngôi nhà bên hồ 3-trong-1', 'ngoi-nha-ben-ho-3-trong-1', '31160',
   (select id from public.categories where slug = 'sang-tao'), 'Creator',
   1590000, 1290000, 30, 698, '8+', 2025,
   'Lắp được 3 mô hình: nhà bên hồ, quán cà phê nổi hoặc ngọn hải đăng.',
   '## Một hộp — ba câu chuyện

Tháo ra lắp lại thành 3 mô hình khác nhau với cùng bộ gạch.

### Điểm nổi bật

- 3 mô hình trong 1 hộp
- Đèn trong nhà phát sáng
- Thuyền chèo kèm theo

> Sản phẩm mới 100%, nguyên seal. Hỗ trợ kiểm tra hàng khi nhận.',
   array['/placeholders/ngoi-nha-ben-ho-3-trong-1-1.svg', '/placeholders/ngoi-nha-ben-ho-3-trong-1-2.svg']::text[], '/placeholders/ngoi-nha-ben-ho-3-trong-1-1.svg', true, true, '2025-07-01T08:00:00Z'),
  ('22222222-2222-4222-8222-000000000008', 'Robot khủng long biến hình', 'robot-khung-long-bien-hinh', '31172',
   (select id from public.categories where slug = 'sang-tao'), 'Creator',
   690000, null, 40, 285, '7+', 2025,
   'Khủng long, robot hoặc rồng lửa — tùy bạn sáng tạo.',
   '## Biến hình không giới hạn

Mô hình 3-trong-1 nhỏ gọn, phù hợp làm quà tặng.

### Điểm nổi bật

- Khớp tay chân linh hoạt
- 3 phiên bản lắp ráp

> Sản phẩm mới 100%, nguyên seal. Hỗ trợ kiểm tra hàng khi nhận.',
   array['/placeholders/robot-khung-long-bien-hinh-1.svg', '/placeholders/robot-khung-long-bien-hinh-2.svg']::text[], '/placeholders/robot-khung-long-bien-hinh-1.svg', false, true, '2025-05-18T08:00:00Z'),
  ('22222222-2222-4222-8222-000000000009', 'Đường chân trời Sài Gòn', 'duong-chan-troi-sai-gon', '21065',
   (select id from public.categories where slug = 'kien-truc'), 'Architecture',
   2490000, null, 9, 815, '18+', 2025,
   'Mô hình trưng bày đường chân trời thành phố với các toà nhà biểu tượng.',
   '## Thành phố trên kệ sách

Mô hình kiến trúc tỉ lệ micro, hoàn hảo cho bàn làm việc.

### Điểm nổi bật

- Chi tiết tinh xảo tỉ lệ micro
- Bảng tên trưng bày
- Sách hướng dẫn kèm lịch sử kiến trúc

> Sản phẩm mới 100%, nguyên seal. Hỗ trợ kiểm tra hàng khi nhận.',
   array['/placeholders/duong-chan-troi-sai-gon-1.svg', '/placeholders/duong-chan-troi-sai-gon-2.svg']::text[], '/placeholders/duong-chan-troi-sai-gon-1.svg', true, true, '2025-10-20T08:00:00Z'),
  ('22222222-2222-4222-8222-000000000010', 'Đền thờ rồng thiêng', 'den-tho-rong-thieng', '71820',
   (select id from public.categories where slug = 'sang-tao'), 'Ninjago',
   3790000, 3190000, 7, 1640, '9+', 2024,
   'Ngôi đền 4 tầng với rồng vàng khớp nối và 8 nhân vật ninja.',
   '## Truyền thuyết rồng vàng

Ngôi đền nhiều tầng với bẫy ẩn, phòng luyện võ và rồng khớp nối.

### Điểm nổi bật

- Rồng vàng 20 khớp nối
- Bẫy ẩn và cửa bí mật
- 8 nhân vật

> Sản phẩm mới 100%, nguyên seal. Hỗ trợ kiểm tra hàng khi nhận.',
   array['/placeholders/den-tho-rong-thieng-1.svg', '/placeholders/den-tho-rong-thieng-2.svg']::text[], '/placeholders/den-tho-rong-thieng-1.svg', false, true, '2024-11-11T08:00:00Z'),
  ('22222222-2222-4222-8222-000000000011', 'Tiệm bánh ngọt góc phố', 'tiem-banh-ngot-goc-pho', '41760',
   (select id from public.categories where slug = 'thanh-pho'), 'Friends',
   1190000, 990000, 15, 492, '6+', 2025,
   'Tiệm bánh 2 tầng với lò nướng, quầy bánh và sân thượng xinh xắn.',
   '## Thơm mùi bánh mới

Tiệm bánh nhỏ xinh với rất nhiều phụ kiện đồ ăn.

### Điểm nổi bật

- Hơn 30 phụ kiện bánh ngọt
- Sân thượng có ô dù
- 3 nhân vật

> Sản phẩm mới 100%, nguyên seal. Hỗ trợ kiểm tra hàng khi nhận.',
   array['/placeholders/tiem-banh-ngot-goc-pho-1.svg', '/placeholders/tiem-banh-ngot-goc-pho-2.svg']::text[], '/placeholders/tiem-banh-ngot-goc-pho-1.svg', false, true, '2025-04-02T08:00:00Z'),
  ('22222222-2222-4222-8222-000000000012', 'Máy đánh chữ cổ điển', 'may-danh-chu-co-dien', '21359',
   (select id from public.categories where slug = 'sang-tao'), 'Ideas',
   6490000, null, 3, 2079, '18+', 2024,
   'Máy đánh chữ phong cách retro với phím bấm chuyển động và trục cuốn giấy.',
   '## Hoài niệm cơ khí

Mô hình trưng bày cao cấp cho người lớn, phím bấm hoạt động thật.

### Điểm nổi bật

- Phím bấm nâng cần chữ
- Trục cuốn giấy xoay được
- Màu xanh mint cổ điển

> Sản phẩm mới 100%, nguyên seal. Hỗ trợ kiểm tra hàng khi nhận.',
   array['/placeholders/may-danh-chu-co-dien-1.svg', '/placeholders/may-danh-chu-co-dien-2.svg']::text[], '/placeholders/may-danh-chu-co-dien-1.svg', true, true, '2025-02-14T08:00:00Z')
on conflict (slug) do nothing;
