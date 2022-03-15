const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');
fs = require('fs');

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
//opening application requirements:
//view all departments
//view all roles
//view all employees
//add department
//add role
// add employee
//update employee role

const opening_questions = [
    {
        type: 'list',
        name: 'select_an_action',
        message: 'Select an action to complete.',
        choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add a Department', 'Add a new Role', 'Add a New Employee',
            'Update an Employee Role', 'Exit']
    },
];

function init() {
    const sel_option = '5';
    console.log(sel_option);
    inquirer.prompt(opening_questions).then((answers) => {
            console.log(answers.select_an_action);
        });
        // .then((sel_option) => {
        //     switch (sel_option) {
        //         case 'View All Departments':
        //             view_dep();
        //             break;
        //         case 'View All Roles':
        //             view_role();
        //             break;
        //         case 'View All Employees':
        //             view_employee();
        //             break;
        //         case 'Add a Department':
        //             add_dep();
        //             break;
        //         case 'Add a new Role':
        //             add_role();
        //             break;
        //         case 'Add a New Employee':
        //             add_employee();
        //             break;
        //         case 'Update an Employee Role':
        //             update_employee();
        //             break;
        //         case 'Exit':
        //             return;
        //     }
        // });
};


// const view_dep = () => {
//     const sql = `SELECT * FROM department`;
//     const table = cTable.getTable(db.query(sql, (err, result) => {
//         if (err) {
//             result.serverStatus(400).json({ error: err.message });
//             return;
//         }
//         result.json(result);
//     }));
//     console.log(table);
// };

// const view_role = () => {

// };

// const view_employee = () => {

// };

// const add_dep = () => {

// };

// const add_role = () => {

// };

// const add_employee = () => {

// };


// const update_employee = () => {

// };


init();