const forge =  require("node-forge")
const express = require("express")

const app = express()

app.use(express.json())

const DEFAULT_COLLECTION = [
  {
    name: "Mona Lisa",
    author: "Leonardo da Vinci",
    id: 1,
    bids: [
      {
        userId: 1,
        value: 4000,
        createdAt: new Date()
      }
    ],
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
    email: "john.richman@email.com",
    pwd: "55a5e9e78207b4df8699d60886fa070079463547b095d1a05bc719bb4e6cd251", //senha123
    id: 1,
    transactions: [
      {
        value: 30000,
        description: 'deposit',
        createdAt: new Date()
      },
      {
        value:-4000,
        description: 'bid',
        createdAt: new Date(),
        artId: 1
      }
    ]
  },
  {
    name: "Angela Christina",
    email: "angela.christina@email.com",
    pwd: "f4610aa514477222afac2b77f971d069780ca2846f375849f3dfa3c0047ebbd1", //batata
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

  DEFAULT_COLLECTION.push({ name: name,
                            author: author,
                            id: id,
                            bids: []
                          })

  nextArtId++
  response.status(201).send()
})

app.get("/users", (request, response) => {
  return response.json(DEFAULT_USERS.map(user =>  (
                                                    {
                                                      id: user.id,
                                                      name: user.name,
                                                      email: user.email,
                                                      pwd: user.pwd,
                                                      transactions: user.transactions,
                                                    }
                                                  )))
})

app.get("/users/:id", (request, response) => {
  const { id } = request.params
  const user = DEFAULT_USERS.find(user => user.id === parseInt(id))
  return (!user ?
            response.status(404).json({error: "Unexistent user"}) :
            response.json(user))
})

app.post("/users", (request, response) => {
  let md = forge.md.sha256.create();

  const { email, name, pwd } = request.body

  md.update(pwd)

  const isUserAlreadyRegistered = DEFAULT_USERS.some((user) => user.email === email.toLowerCase() )

  if(isUserAlreadyRegistered) {
    return response.status(400).json({error: "User is already registered"})
  }

  DEFAULT_USERS.push({ name: name,
                       email: email.toLowerCase(),
                       id: nextUserId,
                       pwd: md.digest().toHex(),
                       transactions: [],
                      })

  nextUserId++
  response.status(201).json({ok: "User registered :)"})

})



function authenticateUser(request, response, next) {
  const { email, pwd } = request.headers

  if(!pwd || !email){
    return response.status(400).json({error: "Missing headers, access denied"})
  }
  let md = forge.md.sha256.create();
  md.update(pwd)

  const user = DEFAULT_USERS.find((user) => (user.email === email && user.pwd === md.digest().toHex()))

  request.user = user

  return (!user ?
    response.status(403).json({error: "Unauthorized headers, access denied"}) :
    next())
}

//AUTHENTICATION
app.use(authenticateUser)
//AUTHENTICATION

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

app.get("/budget", (request, response) => {

  const { user } = request

  return response.json({
    budget: sumTransactions(user.transactions)
  })
})

app.post("/deposit", (request, response) => {
  let { amount } = request.body

  if(amount > Number.MAX_SAFE_INTEGER) {
    return response.status(400).json({error: `Max accepted number: ${Number.MAX_SAFE_INTEGER}`})
  }

  amount = parseInt(amount)

  if(amount <= 0 || !amount || amount === null) {
    return response.status(400).json({error: "The deposited amount must be a positive number"})
  }

  const { user } = request

  const deposit = {
    value: parseInt(amount),
    description: 'deposit',
    createdAt: new Date()
  }

  user.transactions.push(deposit)
  return response.status(201).json({ok: "Success! Deposit made"})

})

app.post("/withdraw", (request, response) => {
  let { amount } = request.body

  amount  = amount > 0 ? amount * -1 : amount

  if(amount < Number.MIN_SAFE_INTEGER) {
    return response.status(400).json({error: `Min accepted number: ${Number.MIN_SAFE_INTEGER}`})
  }

  amount = parseInt(amount)

  if(amount === 0 || !amount || amount === null) {
    return response.status(400).json({error: "The withdrawn amount must be a number different from 0"})
  }


  const { user } = request

  if((sumTransactions(user.transactions) + amount) < 0){
    return response.status(403).json({error: "You can't remove more funds than your available budget"})
  }

  const withdrawal = {
    value: amount,
    description: 'withdrawal',
    createdAt: new Date()
  }

  user.transactions.push(withdrawal)
  return response.status(201).json({ok: "Success! Withdrawal made"})

})

app.put("/user", (request, response) => {
  const { name, email, pwd } = request.body
  const { user } = request

  let md = forge.md.sha256.create();
  md.update(pwd)

  if (!name && !email && !pwd) {
    return response.status(400).json({ error: "No inputs detected" })
  }


  if (name) {
    user.name = name
  }

  if (email) {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g
    if(!emailRegex.test(email)){
      return response.status(400).json({ error: "Invalid email" })
    }
    user.name = email
  }

  if (pwd) {
    if(pwd.length < 6){
      return response.status(400).json({ error: "Your password needs to have at least 6 characters" })
    }
    user.pwd = md.digest().toHex()
  }

  return response.status(201).json({ ok: "Changes saved" })
})

app.delete("/user", (request, response) => {
  const { user } = request

  if (sumTransactions(user.transactions) > 0) {
    return response.status(403).json({ error: "There are still funds in your account. Withdraw them before deletion" })
  }

  DEFAULT_USERS.splice(user, 1)

  return response.status(200).json({ ok: "User deleted" })
})



app.listen(3030)

module.exports = app
