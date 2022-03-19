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

const opening_questions = [
    {
        type: 'list',
        name: 'select_an_action',
        message: 'Select an action to complete.',
        choices: ['View All Departments', 'View All Roles', 'View All Employees', "View A Manager's Employees", 'Add a Department', 'Add a new Role', 'Add a New Employee',
            'Update an Employee', "Delete a Department, Employee, or Role", 'Exit']
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
        return sel_option;
    })
        .then((sel_option) => {
            switch (sel_option) {
                case 'View All Departments':
                    view_dep();
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
                case 'Update an Employee':
                    update_employee();
                    break;
                case "View A Manager's Employees":
                    view_managers_employees();
                    break;
                case 'Exit':
                    process.exit();
            }
        });
};

const view_dep = () => {
    let table = cTable;
    console.log("  ");
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
    console.log("  ");
    const sql = `SELECT role.title AS Title, role.id, department.Dep_name AS Department, role.salary FROM role LEFT JOIN department ON role.department_id=department.id`;
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

const view_employees = () => {
    let table = cTable;
    let grouping = '';
    const view_question = [
        {
            type: 'list',
            name: 'select_an_action',
            message: 'How do you want the employee view organized?',
            choices: ['By Manager', 'By Department', 'Alphabetically', 'Exit']
        }
    ];
    inquirer.prompt(view_question).then((answers) => {
        if (answers.select_an_action === 'By Manager') {
            grouping = 'ORDER BY Manager';
        }
        else if (answers.select_an_actiond === 'By Department') {
            grouping = 'ORDER BY Department';
        }
        else if (answers.select_an_actiond === 'Alphabetically') {
            grouping = "ORDER BY 'LAST Name'";
        }
        else {
            init();
        }
    });
    
    console.log("  ");

    const sql = `SELECT employee.id, employee.first_name AS 'First Name', employee.last_name AS 'Last Name', role.title AS Title, role.salary AS Salary, department.Dep_name as Department, CONCAT(mgr.first_name, " ", mgr.last_name) AS Manager 
    FROM employee 
    INNER JOIN role ON employee.role_id=role.id 
    INNER JOIN department on role.department_id=department.id 
    LEFT OUTER JOIN employee mgr on employee.manager_id = mgr.id
    ${grouping}`;

    console.log(sql);
    
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

const view_managers_employees = () => {
    let table = cTable;
    console.log("  ");
    let man_obj = [];
    const sql = `Select CONCAT(first_name, " ", last_name) AS Manager, employee.id from employee WHERE employee.manager_id IS NULL`;
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            console.log('the view employees query went wrong');
            return;
        }
        result.forEach((element, index) => {
            let t_obj = { name: element.Manager, value: element.id };
            man_obj.push(t_obj);
        });
        let man_q = [
            {
                type: 'list',
                name: 'select_manager',
                message: 'Select a Manager to view their employees',
                choices: man_obj
            }];
        inquirer.prompt(man_q).then((answers) => {
            let man_id = parseInt(answers.select_manager);
            //make sure its an integer so we wont kick an error.
            const sql = `SELECT employee.id, employee.first_name AS 'First Name', employee.last_name AS 'Last Name', role.title AS Title, role.salary AS Salary, department.Dep_name as Department 
            FROM employee 
            INNER JOIN role ON employee.role_id=role.id 
            INNER JOIN department on role.department_id=department.id
            WHERE employee.manager_id = ?`;
            db.query(sql, man_id, (err, result) => {
                if (err) {
                    console.log(err);
                    console.log('the view by manager went wrong');
                    return;
                }
                table = result;
                console.table(table);
                init();
            });
        });
    });
};

const add_dep = () => {
    let table = cTable;
    console.log('im in add dep');
    console.log(' ');
    inquirer.prompt(dep_question).then((answers) => {
        let dep_name = answers.dep_input;
        const sql = `INSERT into department (Dep_name) Values (?)`;
        db.query(sql, dep_name, (err, result) => {
            if (err) {
                console.log('something went wrong exiting .js file');
                console.log(err);
                return;
            }
            console.log('Successfully added a new department: \n');
            view_dep();
        });
    });
};

const add_role = async () => {
    let table = cTable;
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
            message: 'Select a department to add the role to',
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
                console.log('Successfully added a new role: \n')
                view_role();
            });
        });
    });
};

const add_employee = () => {
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
                const sql = `INSERT into employee (first_name, last_name, role_id, manager_id) Values (?, ?, ?, ?)`;
                db.query(sql, emp_values, (err, result) => {
                    if (err) {
                        console.log('something went wrong with the new role insert');
                        console.log(err);
                        return;
                    }
                    console.log('Successfully added a new employee! \n');
                    view_employees();
                    init();
                });
            });
        });
    });
};

const update_role_q = (empl_id) => {
    let emp_q = [];
    let t_obj = [];
    console.log('im in update role');
    const sql = `SELECT role.title, role.id FROM role`;
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            console.log('the view roles query went wrong');
            return;
        }
        console.log('query was successful');
        console.log(result);
        for (let i = 0; i < result.length; i++) {
            t_obj[i] = { name: result[i].title, value: result[i].id };
        };


        console.log(t_obj);
        let temp_q =
        {
            type: 'list',
            name: 'role',
            message: 'Select a new Role for the Employee.',
            choices: t_obj
        };
        emp_q.push(temp_q);

        inquirer.prompt(emp_q).then((answers) => {
            //make sure its an integer so we wont kick an error.
            let emp_id = parseInt(empl_id);
            let new_role = parseInt(answers.role);
            let emp_values = [new_role, emp_id];

            const sql = `UPDATE employee SET role_id = ? WHERE employee.id = ?`;
            db.query(sql, emp_values, (err, result) => {
                if (err) {
                    console.log('something went wrong with the new role insert');
                    console.log(err);
                    return;
                }
                console.log('Role Updated successfully. \n');
                view_employees();
                init();
            });
        });
    });
}

const update_manager_q = (empl_id) => {
    let mgr_q = [];
    let t_obj = [];
    const sql = `Select CONCAT(first_name, " ", last_name) AS Manager, employee.id from employee WHERE employee.manager_id IS NULL`;
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            console.log('the view roles query went wrong');
            return;
        }
        console.log(result);
        for (let i = 0; i < result.length; i++) {
            t_obj[i] = { name: result[i].Manager, value: result[i].id };
        };
        let temp_q =
        {
            type: 'list',
            name: 'manager',
            message: 'Select a new Manager for the Employee.',
            choices: t_obj
        };
        mgr_q.push(temp_q);

        console.log(mgr_q);

        inquirer.prompt(mgr_q).then((answers) => {
            //make sure its an integer so we wont kick an error.
            let emp_id = parseInt(empl_id);
            let new_mgr = parseInt(answers.manager);
            let emp_values = [new_mgr, emp_id];

            const sql = `UPDATE employee SET manager_id = ? WHERE employee.id = ?`;
            db.query(sql, emp_values, (err, result) => {
                if (err) {
                    console.log('something went wrong with the new role insert');
                    console.log(err);
                    return;
                }
                console.log('Manager Updated successfully. \n');
                view_employees();
                init();
            });
        });
    });
}

const update_employee = () => {
    let table = cTable;
    let emp_q = [];
    let update_emp = [];
    const sql = `SELECT CONCAT(employee.first_name, '  ', employee.last_name) as Name, employee.id, role.title AS Title
    FROM employee 
    INNER JOIN role ON employee.role_id=role.id`;
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            console.log('the view employees query went wrong');
            return;
        }
        result.forEach((element) => {
            let t_name = element.Name + ', ' + element.Title;
            let t_obj = { name: t_name, value: element.id };
            update_emp.push(t_obj);
        });

        console.log(update_emp);
        let temp_q = {
            type: 'list',
            name: 'empl_id',
            message: 'Select an Employee to update',
            choices: update_emp
        };

        emp_q.push(temp_q);

        let question = {
            type: 'list',
            name: 'wtd',
            message: 'Select an update to make.',
            choices: ['Change Role', 'Change Manager', 'Make Them a Manager', 'Exit']
        };

        emp_q.push(question);
        console.log(emp_q);
        inquirer.prompt(emp_q).then((answers) => {
            let emp_id = answers.empl_id
            if (answers.wtd === 'Change Role') {
                update_role_q(emp_id);
            }
            else if (answers.wtd === 'Change Manager') {
                update_manager_q(emp_id);
            }
            else if (answers.wtd === 'Make Them a Manager') {
                make_manager_q(emp_id);
            }
            else {
                init();
            }
        });
    });
};

init();