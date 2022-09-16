const express = require("express");
// v4 - vai gerar numeros randomicos aleatorios
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

// Simulação de banco de dados
const customers = [];

/** 
 * cpf - string
 * name - string
 * id - uuid
 * statement (extrato, lançamentos) - array => []
*/

app.post('/account', (request, response) => {
    const { cpf, name } = request.body;

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

app.listen(2000);