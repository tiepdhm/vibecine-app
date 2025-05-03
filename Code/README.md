# Hướng Dẫn Cài Đặt và Chạy Ứng Dụng

## Yêu Cầu
- Node.js v22.15.0 (với `npm`)
- Python 3.12.3
- MongoDB (cloud)
- Hệ điều hành: Windows (hướng dẫn dùng cú pháp cho Windows, nếu dùng macOS hoặc Linux, cần điều chỉnh lại cú pháp cho phù hợp)
---

## Cấu Trúc Dự Án
```
Code/
├── App/
│   ├── Backend/
│   ├── Frontend/
└── README.md

```
---

## Dataset, file model và file csv review để chạy thử
- Bộ IMDB Dataset of 50K Movie Reviews dùng để huấn luyện mô hình, truy cập [**link sau**](https://drive.google.com/drive/folders/1G9spa0qfbUC7qvYa3GWeH5fMoIze9CFE) để tải (hoặc tải trực tiếp tại https://www.kaggle.com/datasets/lakshmi25npathi/imdb-dataset-of-50k-movie-reviews).

- Các file model đã huấn luyện, truy cập [**link sau**](https://drive.google.com/drive/folders/1oq5jzAZBIkJnMA3SSrMtdO0N1i9loTcl) để tải (để các file tải về trong folder `App/Backend/models/save`).

- Các file csv chứa review phim để người dùng upload trên app chạy thử, truy cập [**link sau**](https://drive.google.com/drive/folders/1USRfQNB7fUkMkBsgpvoHjcfZ7LCcjeBW) để tải.
---



## Lưu ý khi sử dụng MongoDB Atlas

- **Bắt buộc phải thêm địa chỉ IP của bạn vào mục "Network Access" trong MongoDB Atlas.**
- Nếu gặp thông báo lỗi `SSL Handshake` khi chạy ứng dụng, rất có thể là do IP máy bạn đã thay đổi, hãy kiểm tra và thêm lại địa chỉ IP mới vào MongoDB.
---

## Tài khoản đăng nhập MongoDB của ứng dụng
Truy cập https://cloud.mongodb.com/ và đăng nhập thông qua Google với tài khoản sau:
```bash
Email: vibecineapp@gmail.com
Mật khẩu: review123
```
Truy cập mục "Network Access" trong phần "Security" và thêm địa chỉ IP của bạn.

**Note: Bạn có thể tự tạo tài khoản MongoDB riêng và thay đường dẫn của `MONGODB_URL` trong file `App/Backend/app/core/config.py` bằng connection string của Cluster bạn tạo (tham khảo thêm hướng dẫn sử dụng của MongoDB). Lưu ý khi sử dụng tài khoản MongoDB tự tạo cần phải thực hiện thêm một số tùy chỉnh khác để ứng dụng có thể chạy được. Chi tiết cài đặt bạn có thể trao đổi thêm qua email dhmtiep.sdh241@hcmut.edu.vn**

## Hướng Dẫn Chạy Ứng Dụng

### Đầu tiên mở 2 cửa sổ Terminal

#### Terminal 1: Di chuyển vào thư mục Frontend
```bash
cd <đường_dẫn_đến_folder_Frontend_trên_máy>
```
#### Terminal 2: Di chuyển vào thư mục Backend
```bash
cd <đường_dẫn_đến_folder_Backend_trên_máy>
```

---

### Bên Terminal Frontend


#### Cài đặt các thư viện (chỉ cần làm ở lần chạy đầu tiên trên máy)
```bash
npm install
```

#### Khởi động frontend
```bash
npm run dev
```
---

### Bên Terminal Backend

#### Tạo môi trường ảo (chỉ cần làm ở lần chạy đầu tiên trên máy)
```bash
python -m venv venv
```

#### Kích hoạt môi trường ảo (Windows)
```bash
.\venv\Scripts\activate
```

#### Cài đặt các thư viện trong file `requirements.txt` (chỉ cần làm ở lần chạy đầu tiên trên máy)
```bash
pip install -r requirements.txt
```

#### Chạy file khởi tạo cho NLTK (chỉ cần làm ở lần chạy đầu tiên trên máy)
```bash
python app/core/setup_nltk.py
```

#### Khởi động server backend
```bash
uvicorn main:app
```

#### Khi dùng xong ứng dụng, muốn dừng server:
- Nhấn `Ctrl + C`

---

### Tài khoản tạo sẵn cho ứng dụng (liên kết với dữ liệu trong tài khoản MongoDB cung cấp ở trên)
#### Tài khoản Admin
```bash
username: admin
password: hello123
```
#### Tài khoản Data scientist
```bash
username: datascientist
password: hello123
```
#### Tài khoản User (có thể đăng kí thêm các tài khoản khác thông qua ứng dụng)
```bash
username: userA
password: hello123
```





