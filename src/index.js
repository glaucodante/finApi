const { response } = require("express");
const express = require("express");
// v4 - vai gerar numeros randomicos aleatorios
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

// Simulação de banco de dados
const customers = [];

// Middleware
// next = irá definir se o middleware vai prosseguir ou não
function verifyIfExistsAcountCPF(request, response, next) {
    const { cpf } = request.headers;

    // find irá retornar um valor
    const customer = customers.find(customer => customer.cpf === cpf);

    if (!customer) {
        return response.status(400).json({ error: "Customer not found" });
    }

    request.customer = customer;

    return next();

};

function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if (operation.type === "credit") {
            return acc + operation.amount;
        } else {
            return acc - operation.amount;
        }
    }, 0);

    return balance;
}

/** 
 * cpf - string
 * name - string
 * id - uuid
 * statement (extrato, lançamentos) - array => []
*/

// conta do cliente
app.post('/account', (request, response) => {
    const { cpf, name } = request.body;
    // some irá retornar um boolean
    const customerAlreadyExists = customers.some(
        (customer) => customer.cpf === cpf
    );
    // Customer already exists = O cliente já existe
    if (customerAlreadyExists) {
        return response.status(400).json({ error: "Customer already exists!" });
    };



    // inserindo dados dentro de um array
    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: [],
    });

    return response.status(201).send();
});

// app.use(verifyIfExistsAcountCPF);

// extrato bancário
app.get('/statement/', verifyIfExistsAcountCPF, (request, response) => {
    const { customer } = request;
    return response.json(customer.statement);
});

app.post('/deposit', verifyIfExistsAcountCPF, (request, response) => {
    const { description, amount } = request.body;

    // verifica se a conta é válida ou não
    const { customer } = request;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    }
    // inserindo a operação dentro do customer
    customer.statement.push(statementOperation);

    return response.status(201).send();

});

app.post('/withdraw', verifyIfExistsAcountCPF, (request, response) => {
    const { amount } = request.body;
    const { customer } = request;

    const balance = getBalance(customer.statement);

    if (balance < amount) {
        return response.status(400).json({ error: "Insufficient funds!" });
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: "debit",
    };



    customer.statement.push(statementOperation);

    return response.status(201).send();


});

app.get('/statement/date', verifyIfExistsAcountCPF, (request, response) => {
    const { customer } = request;
    const { date } = request.query;

    // transformar a data, independente do horário da transação 
    const dateFormat = new Date(date + "00:00");
    // transformando para esse formato 10/10/2000
    const statement = customer.statement.filter(
        (statement) =>
            statement.created_at.toDateString() ===
            new Date(dateFormat).toDateString());

    return response.json(customer.statement);
});

app.listen(2000);