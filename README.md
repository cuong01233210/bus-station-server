# bus-station-server

Cài từ đầu
Bước 1: Cài đặt typescript
npm install -g typescript
Bước 2: Khởi tạo file tsconfig
tsc --init

Trong file tsconfix sửa

- target thành ts6 hoặc ts2016
- uncommment "ourDir" : "./dist"
- uncomment "rootDir": "./src"
- uncomment "moduleResolution" : "node"
- bổ sung "include": ["src/**/*.ts"],
  "exclude": ["node_modules"] để deploy

Bước 3: Khởi tạo file package.json
npm init -y

Bước 4: Cài express
npm install express

Bước 5: Cài các thư viện khác
npm install --save-dev @types/express @types/node ts-node typescript

Bước 6: Cài nodemon nếu lười biên dịch code sang js
npm install nodemon

Bước 7: Trong file package.json vào sửa đoạn script

Nếu chạy bằng nodemon: "dev": "nodemon ./src/app.ts"
Lúc này câu lệnh chạy sẽ là npm run dev

Nếu chạy bằng cách compile sang js thì làm 2 loại script

- "start": "node dist/app.js",
- "build": "tsc"

Lúc này sẽ chạy lệnh "npm run build" để build
Và "npm start" để chạy lệnh

Lưu ý, khi deploy thì railway chỉ đọc code đã được build trong ".dist" nên trước khi update git cần build lại

Note:

- Khi nào cài thư viện không được thì nhớ spam sudo
- Khi thêm thư viện mới thì cứ công thức npm install + tên thư viện hoặc lên gpt mà lấy lệnh
- Cài nhanh all thư viện khi có sẵn file tsconfig và package.json nhưng chưa có file node_modules
  npm install
- project sau có nhìn mẫu thì nhớ cho thư viện vào trong gitignore
