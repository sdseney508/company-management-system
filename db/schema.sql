DROP DATABASE IF EXISTS comp_management_sys_db;
CREATE DATABASE comp_management_sys_db;

USE comp_management_sys_db;

CREATE TABLE department (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Dep_name VARCHAR(30) NOT NULL
);

CREATE TABLE role (
    id int not null AUTO_INCREMENT primary KEY,
    title VARCHAR(30),
    salary decimal not null,
    department_id int,
    FOREIGN KEY (department_id) 
    REFERENCES department(id)
    On delete set null
);

create table employee (
    id int not null AUTO_INCREMENT primary key,
    first_name varchar(30) not NULL,
    last_name varchar(30) not null,
    role_id int not NULL,
    manager_id int,
    FOREIGN KEY (role_id)
    REFERENCES role(id)
    on delete SET NULL
);