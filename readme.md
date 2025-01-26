# CSV to JSON Converter API

## Steps to Run

### 1. Clone the Repository
```bash
git clone https://github.com/jigarkataria/Kelp-Project
cd Kelp-Project
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up MySQL Database
Run the following SQL script to create the required table:
```sql
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  age INT,
  email VARCHAR(100),
  additional_info JSON
);
```

### 4. Set Up Environment Variables
Create a `.env` file in the root directory with the following:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=yourdatabase
PORT=3000
```

### 5. Start the Server
```bash
npm start
```

---

## API Endpoints

### 1. Upload CSV
- **Endpoint**: `POST /upload`
- **Description**: Upload a CSV file and insert its data into the database.
- **Request Requirements**:
  - Use `multipart/form-data`.
  - File field name: `file`.
- **Example cURL Command**:
```bash
curl -X POST -F "file=@<path-to-your-csv-file>" http://localhost:3000/upload
```

### 2. Get Age Distribution Report
- **Endpoint**: `GET /report/age-distribution`
- **Description**: Retrieve a report of age distribution percentages.
- **Example cURL Command**:
```bash
curl -X GET http://localhost:3000/report/age-distribution
```
