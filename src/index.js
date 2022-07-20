const express = require("express")

const app = express()

app.use(express.json())

const DEFAULT_COLLECTION = [
  {
    name: "Mona Lisa",
    author: "Leonardo da Vinci",
    id: 1,
    bids: [],
  },
  {
    name: "Starry Night",
    author: "Vincent van Gogh",
    id: 2,
    bids: [],
  },
  {
    name: "Guernica",
    author: "Pablo Picasso",
    id: 3,
    bids: [],
  },
]

const DEFAULT_USERS = [
  {
    name: "John Richman",
    cpf: "11144477735",
    id: 1,
    transactions: [
      {
        value: 30000,
        description: 'deposit',
      },
      {
        value:-4000,
        description: 'bid',
        artId: 1
      }]
  },
  {
    name: "Angela Christina",
    cpf: "25916251661",
    id: 2,
    transactions: []
  },
]

let nextUserId = 3
let nextArtId = 4
app.get("/arts", (request, response) => {
    return response.json(DEFAULT_COLLECTION)
  }
)

app.post("/arts", (request, response) =>{
  const { name, author } = request.body
  const id = randomUuid()
  const bids = []

  DEFAULT_COLLECTION.push({ name: name,
                            author: author,
                            id: id,
                            bids: bids
                          })

 response.status(201).send()
})

app.get("/users", (request, response) => {
  return response.json(DEFAULT_USERS)
})

app.post("/users", (request, response) => {
  const { cpf, name } = request.body

  const isUserAlreadyRegistered = DEFAULT_USERS.some((user) => user.cpf === cpf )

  if(isUserAlreadyRegistered) {
    return response.status(400).json({error: "User is already registered"})
  }

  DEFAULT_USERS.push({ name: name,
                       cpf: cpf,
                       id: nextUserId,
                       transactions: [],
                      })

  nextUserId++
  response.status(201).send()

})

app.get("/users/:id/budget", (request, response) => {
  function sumTransactions(transactions){
    sum = 0

    if (transactions === []) {
      return sum
    }

    transactions.forEach(transaction => {
      sum += transaction.value
    });

    return sum
  }

  const { id } = request.params

  const user = DEFAULT_USERS.find(user => user.id === parseInt(id))

  return response.json({
    budget: sumTransactions(user.transactions)
  })
})


// app.listen(3001)

module.exports = app
