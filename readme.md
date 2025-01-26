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



## Assumptions
1. **Database Assumptions**:
   - A MySQL database is already set up and accessible using the `.env` configuration.
   - The `users` table must exist in the database with the specified schema.
   - The users table does not have any unique constraints or indexes beyond the id primary key. Adding indexes for optimization can be considered based on usage patterns.
   - The additional_info column is used to store non-mandatory and dynamic fields as JSON.
   - No database-level validation is enforced (e.g., for age ranges, email formats). Validation is assumed to happen in the application layer.

2. **CSV File Assumptions**:
   - The CSV file will always have headers in the first row.
   - Mandatory fields: `name.firstName`, `name.lastName`, and `age`.
   - Any additional columns in the CSV file will be stored in the `additional_info` column as JSON.

3. **Application Assumptions**:
   - The server will run on the port specified in the `.env` file (default: `3000`).
   - The database column `additional_info` is used to store all dynamic and non-mandatory fields.

4. **General Assumptions**:
   - The uploaded file size will not exceed the system's file size limits.
   - Any invalid or missing fields in the CSV will be handled gracefully.
