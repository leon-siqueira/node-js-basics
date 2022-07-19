const { v4: randomUuid } = require("uuid")
const express = require("express")

const app = express()

app.use(express.json())

const DEFAULT_COLLECTION = [
  {
    name: "Mona Lisa",
    author: "Leonardo da Vinci",
    id: randomUuid(),
    bids: [],
  },
  {
    name: "Starry Night",
    author: "Vincent van Gogh",
    id: randomUuid(),
    bids: [],
    id2: randomUuid()
  },
  {
    name: "Guernica",
    author: "Pablo Picasso",
    id: randomUuid(),
    bids: [],
  },
]

const DEFAULT_USERS = [
  {
    name: "John Richman",
    cpf: "11144477735",
    id: randomUuid(),
    transactions: []
  },
  {
    name: "Angela Christina",
    cpf: "25916251661",
    id: randomUuid(),
    transactions: []
  },
]

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
                       id: randomUuid(),
                       transactions: [],
                      })

  response.status(201).send()

})

app.listen(3030)
