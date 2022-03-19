'use strict';
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');
const fs = require('fs');

const db = mysql.createConnection(
    {
        host: 'localhost',
        // MySQL username,
        user: 'root',
        //add PORT if not on 3306 for mysql
        password: 'abcd',
        database: 'comp_management_sys_db'
    },
    console.log(`Connected to the comp_management_sys_db database.`)
);
// ## Acceptance Criteria

// GIVEN a command-line application that accepts user input
// WHEN I start the application
// DONE - THEN I am presented with the following options: view all departments, view all roles, view all employees, add a department, add a role, add an employee, and update an employee role
// WHEN I choose to view all departments
// DONE - THEN I am presented with a formatted table showing department names and department ids
// WHEN I choose to view all roles
// Done - THEN I am presented with the job title, role id, the department that role belongs to, and the salary for that role
// WHEN I choose to view all employees
// THEN I am presented with a formatted table showing employee data, including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to
// WHEN I choose to add a department
// THEN I am prompted to enter the name of the department and that department is added to the database
// WHEN I choose to add a role
// THEN I am prompted to enter the name, salary, and department for the role and that role is added to the database
// WHEN I choose to add an employee
// THEN I am prompted to enter the employee’s first name, last name, role, and manager, and that employee is added to the database
// WHEN I choose to update an employee role
// THEN I am prompted to select an employee to update and their new role and this information is updated in the database 

//opening application requirements:
//view all departments
//view all roles
//view all employees
//add department
//add role
//add employee
//update employee role
// Update employee managers.

// * View employees by manager.

// * View employees by department.

// * Delete departments, roles, and employees.

// * View the total utilized budget of a department&mdash;in other words, the combined salaries of all employees in that department.

const opening_questions = [
    {
        type: 'list',
        name: 'select_an_action',
        message: 'Select an action to complete.',
        choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add a Department', 'Add a new Role', 'Add a New Employee',
            'Update an Employee Role', 'Exit']
    },
];

const dep_question = [
    {
        type: 'input',
        name: 'dep_input',
        message: 'Please Enter a Department Name to add to the database.',
    },
];

const role_question = [
    {
        type: 'input',
        name: 'role_input',
        message: 'Please Enter a Role to add to the database.',
    },
    {
        type: 'input',
        name: 'salary_input',
        message: 'Please Enter a Salary.',
    },
];

const emp_question = [
    {
        type: 'input',
        name: 'first_name',
        message: 'Please Enter the Employees First Name.',
    },
    {
        type: 'input',
        name: 'last_name',
        message: 'Please Enter the Employees Last Name.',
    }
];

function init() {
    let sel_option = '  ';
    console.log(sel_option);
    inquirer.prompt(opening_questions).then((answers) => {
        sel_option = answers.select_an_action;
        console.log(sel_option);
        return sel_option;
    })
        .then((sel_option) => {
            console.log('in the switch case');
            console.log(sel_option);
            switch (sel_option) {
                case 'View All Departments':
                    view_dep();
                    console.log(sel_option);
                    break;
                case 'View All Roles':
                    view_role();
                    break;
                case 'View All Employees':
                    view_employees();
                    break;
                case 'Add a Department':
                    add_dep();
                    break;
                case 'Add a new Role':
                    add_role();
                    break;
                case 'Add a New Employee':
                    add_employee();
                    break;
                case 'Update an Employee Role':
                    update_employee();
                    break;
                case 'Exit':
                    process.exit();
                    return;

            }
        });
};

const view_dep = () => {
    let table = cTable;
    console.log("i'm in view_dep");
    const sql = `SELECT * FROM department`;
    db.query(sql, (err, result) => {
        if (err) {
            result.serverStatus(400).json({ error: err.message });
            return;
        }
        table = result;
        console.table(table);
        init();
    });
};

const view_role = () => {
    let table = cTable;
    console.log("i'm in view_role");
    const sql = `SELECT role.title, role.id, department.Dep_name AS Department, role.salary FROM role LEFT JOIN department ON role.department_id=department.id`;
    db.query(sql, (err, result) => {
        if (err) {
            console.log('the view roles query went wrong');
            return;
        }
        table = result;
        console.table(table);
        init();
    });
};
//, employee.CONCAT(firstname, " ", lastname) AS Manager department.Dep_name, 
// INNER JOIN deparment ON role.department_id=department.id , role.title, role.salary, INNER JOIN role ON employee.role_id=role.id

//CONCAT(first_name, " ", last_name) AS Manager  

const view_employees = () => {
    let table = cTable;
    console.log("i'm in view_employee");
    const sql = `SELECT employee.id, employee.first_name AS 'First Name', employee.last_name AS 'Last Name', CONCAT(mgr.first_name, " ", mgr.last_name) AS Manager, role.title AS Title, role.salary AS Salary, department.Dep_name as Department 
    FROM employee 
    INNER JOIN role ON employee.role_id=role.id 
    INNER JOIN department on role.department_id=department.id 
    LEFT OUTER JOIN employee mgr on employee.manager_id = mgr.id`;
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            console.log('the view employees query went wrong');
            return;
        }
        table = result;
        console.table(table);
        init();
    });
};

const add_dep = () => {
    let table = cTable;
    console.log('im in add dep');
    console.log(' ');
    inquirer.prompt(dep_question).then((answers) => {
        let dep_name = answers.dep_input;
        console.log('this is what came over in answers: ');
        console.log('  ');
        console.log(dep_name);
        console.log(' ');
        console.log("i'm in add department");
        const sql = `INSERT into department (Dep_name) Values (?)`;
        db.query(sql, dep_name, (err, result) => {
            if (err) {
                console.log('something went wrong exiting .js file');
                console.log(err);
                return;
            }
            console.log('added a new department?');
            const sql = `SELECT * FROM department`;
            db.query(sql, dep_name, (err, result) => {
                if (err) {
                    console.log('something went wrong with the view department query after the add_dep query.');
                    console.log(err);
                    return;
                }
                table = result;
                console.table(table);
            });
            init();
        });
    });
};

const add_role = async () => {
    //array for the temp question that will be pushed
    let temp_q = [];
    //role questions array
    const rol_qs = [...role_question];
    //selecting all of the departments to give the user a slecet list for the role to be tied to
    const sql = `SELECT * FROM department`;
    db.query(sql, (err, result) => {
        if (err) {
            result.serverStatus(400).json({ error: err.message });
            return;
        }
        //take the query result and make them an object that inquirer can use in the choices list
        result.forEach((element, index) => {
            let t_obj = { name: element.Dep_name, value: element.id };
            temp_q.push(t_obj);
        });
        let temp_question =
        {
            type: 'list',
            name: 'select_dep',
            message: 'Select a department to add the role to.',
            choices: temp_q
        };
        //add the question to the roles question array
        rol_qs.push(temp_question);

        inquirer.prompt(rol_qs).then((answers) => {
            let role_name = answers.role_input;
            //make sure its an integer so we wont kick an error.
            let role_salary = parseInt(answers.salary_input);
            let role_dep = answers.select_dep;
            let role_values = [role_name, role_salary, role_dep];
            const sql = `INSERT into role (title, salary, department_id) Values (?, ?, ?)`;
            db.query(sql, role_values, (err, result) => {
                if (err) {
                    console.log('something went wrong with the new role insert');
                    console.log(err);
                    return;
                }
                console.log('added a new role!');
                init();
            });
        });
    });
};

const add_employee = () => {
    //array for the temp question that will be pushed
    let temp_q = [];
    //emp questions array without overwriting the originals
    const emp_qs = [...emp_question];
    console.log(emp_qs);
    //selecting all of the departments to give the user a slecet list for the role to be tied to

    const sql = `SELECT * FROM role`;

    db.query(sql, (err, result) => {
        let role_q = [];
        if (err) {
            result.serverStatus(400).json({ error: err.message });
            return;
        }
        //take the query result and make them an object that inquirer can use in the choices list
        result.forEach((element, index) => {
            let t_obj = { name: element.title, value: element.id };
            role_q.push(t_obj);
        });
        let temp_question =
        {
            type: 'list',
            name: 'select_role',
            message: 'Select a role.',
            choices: role_q
        };
        //add the question to the emp question array
        emp_qs.push(temp_question);
    //     `SELECT employee.id, employee.first_name AS First Name, employee.last_name AS Last Name, role.title AS Title, role.salary AS Salary, 
    // department.Dep_name as Department FROM employee INNER JOIN role ON employee.role_id=role.id inner join department on role.department_id=department.id`;
        const sql = `SELECT CONCAT(first_name, ' ', last_name) AS Manager, employee.manager_id, department.Dep_name AS Department FROM employee 
        INNER JOIN role ON employee.role_id=role.id INNER JOIN department on role.department_id=department.id WHERE manager_id IS NOT NULL`;
        db.query(sql, (err, result) => {
            let man_q = [];
            if (err) {
                result.serverStatus(400).json({ error: err.message });
                return;
            }
            console.log(result);
            //take the query result and make them an object that inquirer can use in the choices list
            result.forEach((element, index) => {
                let t_obj = { name: element.Manager, value: element.manager_id };
                man_q.push(t_obj);
            });
            let temp_question =
            {
                type: 'list',
                name: 'manager',
                message: 'Select a Manager.',
                choices: man_q
            };
            //add the question to the emp question array
            emp_qs.push(temp_question);
            console.log('after manager insertion');
            console.log(emp_qs);
            inquirer.prompt(emp_qs).then((answers) => {
                let first_name = answers.first_name;
                let last_name = answers.last_name;
                //make sure its an integer so we wont kick an error.
                let role_id = parseInt(answers.select_role);
                let manager_id = parseInt(answers.manager);
                let emp_values = [first_name, last_name, role_id, manager_id];
                console.log(emp_values);
                // const sql = `INSERT into employee (first_name, last_name, role_id, manager_id) Values (?, ?, ?, ?)`;
                // db.query(sql, emp_values, (err, result) => {
                //     if (err) {
                //         console.log('something went wrong with the new role insert');
                //         console.log(err);
                //         return;
                //     }
                //     console.log('added a new employee!');
                //     init();
                // });
            });
        });
    });
};


const update_employee = () => {

};

init();