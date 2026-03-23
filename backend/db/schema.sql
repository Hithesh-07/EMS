CREATE DATABASE IF NOT EXISTS editorial_authority;
USE editorial_authority;

CREATE TABLE departments (
    dept_id INT AUTO_INCREMENT PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL,
    dept_code VARCHAR(10) UNIQUE NOT NULL
);

CREATE TABLE designations (
    desig_id INT AUTO_INCREMENT PRIMARY KEY,
    desig_name VARCHAR(100) NOT NULL,
    grade VARCHAR(20) NOT NULL
);

CREATE TABLE locations (
    loc_id INT AUTO_INCREMENT PRIMARY KEY,
    loc_name VARCHAR(100) NOT NULL,
    loc_code VARCHAR(10) NOT NULL
);

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'HR Manager', 'Accounts', 'Viewer') DEFAULT 'Viewer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employees (
    emp_id VARCHAR(50) PRIMARY KEY, /* e.g., EMP-HR-2026-0001 */
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    blood_group VARCHAR(5),
    aadhaar_number VARCHAR(12) UNIQUE,
    pan_number VARCHAR(10) UNIQUE,
    mobile VARCHAR(15),
    email VARCHAR(100),
    permanent_address TEXT,
    current_address TEXT,
    photo_url VARCHAR(255),
    dept_id INT,
    desig_id INT,
    loc_id INT,
    date_of_joining DATE NOT NULL,
    employment_type ENUM('Full-time', 'Part-time', 'Contract') NOT NULL,
    pf_applicable BOOLEAN DEFAULT FALSE,
    esi_applicable BOOLEAN DEFAULT FALSE,
    basic_pay DECIMAL(10,2) NOT NULL,
    hra DECIMAL(10,2) DEFAULT 0,
    da DECIMAL(10,2) DEFAULT 0,
    other_allowances DECIMAL(10,2) DEFAULT 0,
    bank_account_number VARCHAR(30),
    ifsc_code VARCHAR(20),
    status ENUM('Active', 'Retired', 'Exited') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id),
    FOREIGN KEY (desig_id) REFERENCES designations(desig_id),
    FOREIGN KEY (loc_id) REFERENCES locations(loc_id)
);

CREATE TABLE nominees (
    nominee_id INT AUTO_INCREMENT PRIMARY KEY,
    emp_id VARCHAR(50) NOT NULL,
    nominee_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    contact_number VARCHAR(15),
    address TEXT,
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id)
);

CREATE TABLE employee_documents (
    doc_id INT AUTO_INCREMENT PRIMARY KEY,
    emp_id VARCHAR(50) NOT NULL,
    doc_type VARCHAR(100) NOT NULL, /* Aadhaar Card, PAN Card, Bank Passbook, Joining Order, etc. */
    file_url VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(50),
    verification_status ENUM('Verified', 'Pending', 'Rejected', 'Not Uploaded') DEFAULT 'Pending',
    remarks TEXT,
    version_number INT DEFAULT 1,
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id)
);

CREATE TABLE employee_transfers (
    transfer_id INT AUTO_INCREMENT PRIMARY KEY,
    emp_id VARCHAR(50) NOT NULL,
    transfer_date DATE NOT NULL,
    from_dept_id INT,
    to_dept_id INT,
    from_desig_id INT,
    to_desig_id INT,
    from_loc_id INT,
    to_loc_id INT,
    reason VARCHAR(100), /* Promotion/Rotation/Request/Administrative */
    transfer_order_number VARCHAR(100),
    approved_by VARCHAR(100),
    order_doc_url VARCHAR(255),
    remarks TEXT,
    status ENUM('Initiated', 'Approved', 'Completed') DEFAULT 'Initiated',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id),
    FOREIGN KEY (from_dept_id) REFERENCES departments(dept_id),
    FOREIGN KEY (to_dept_id) REFERENCES departments(dept_id),
    FOREIGN KEY (from_desig_id) REFERENCES designations(desig_id),
    FOREIGN KEY (to_desig_id) REFERENCES designations(desig_id),
    FOREIGN KEY (from_loc_id) REFERENCES locations(loc_id),
    FOREIGN KEY (to_loc_id) REFERENCES locations(loc_id)
);

CREATE TABLE employee_exit (
    exit_id INT AUTO_INCREMENT PRIMARY KEY,
    emp_id VARCHAR(50) NOT NULL,
    last_working_date DATE NOT NULL,
    retirement_type VARCHAR(100) NOT NULL, /* Superannuation/VRS/Death in Service/Resignation */
    approved_by VARCHAR(100),
    initiated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Initiated', 'Checklist Pending', 'FnF Approved', 'Completed') DEFAULT 'Initiated',
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id)
);

CREATE TABLE fnf_settlement (
    fnf_id INT AUTO_INCREMENT PRIMARY KEY,
    emp_id VARCHAR(50) NOT NULL,
    gratuity_amount DECIMAL(12,2) DEFAULT 0,
    leave_encashment DECIMAL(12,2) DEFAULT 0,
    pf_settlement DECIMAL(12,2) DEFAULT 0,
    esi_settlement DECIMAL(12,2) DEFAULT 0,
    loan_recovery DECIMAL(12,2) DEFAULT 0,
    advance_adjustment DECIMAL(12,2) DEFAULT 0,
    other_deductions DECIMAL(12,2) DEFAULT 0,
    net_payable DECIMAL(12,2) DEFAULT 0,
    payment_mode ENUM('NEFT', 'Cheque', 'Cash'),
    payment_date DATE,
    approved_by VARCHAR(100),
    status ENUM('Pending', 'Verified', 'Approved') DEFAULT 'Pending',
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id)
);

CREATE TABLE exit_checklist (
    checklist_id INT AUTO_INCREMENT PRIMARY KEY,
    emp_id VARCHAR(50) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    completed_by VARCHAR(100),
    completed_date TIMESTAMP NULL,
    status ENUM('Done', 'Pending') DEFAULT 'Pending',
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id)
);

CREATE TABLE audit_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action_type VARCHAR(50), /* POST, PUT, DELETE */
    table_name VARCHAR(100),
    record_id VARCHAR(100),
    old_value JSON,
    new_value JSON,
    action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* Seed initial Admin (Password is 'admin123' bcrypt hash placeholder) */
/* The hash below is for 'admin123' */
INSERT INTO users (name, email, password_hash, role) VALUES 
('Super Admin', 'admin@editorialauthority.com', '$2a$10$Xm3tL/wP9w/1wQx0E6B6P.o7tT9y3fO5.kQ3XkQs.nQw1Wv0LXZF6', 'Admin');

INSERT INTO departments (dept_name, dept_code) VALUES 
('Human Resources', 'HR'), ('Information Technology', 'IT'), ('Editorial', 'ED'), ('Production', 'PR');

INSERT INTO designations (desig_name, grade) VALUES 
('Manager', 'M1'), ('Senior Editor', 'E2'), ('Developer', 'T1'), ('Accountant', 'F1');

INSERT INTO locations (loc_name, loc_code) VALUES 
('New Delhi HQ', 'DEL'), ('Mumbai Branch', 'BOM'), ('Bangalore Hub', 'BLR');
