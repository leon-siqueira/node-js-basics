const request = require('supertest')
const app = require('../src/index')

describe('\n/users/:id/budget\n', ()=>{


  it('GET --> shows user\'s money (in cents) available to use on auctions', () =>{
    return request(app)
    .get('/users/1/budget')
    .expect('Content-Type', /json/)
    .expect(200)
    .then((response) => {
      expect(response.body.budget).toBe(26000)
    })
  })

  it('GET --> should be a number', () =>{
    return request(app)
    .get('/users/1/budget')
    .expect('Content-Type', /json/)
    .expect(200)
    .then((response) => {
      expect(response.body).toEqual(
        expect.objectContaining({
          budget: expect.any(Number)
        })
      )
    })
  })

  it('GET --> should not be negative', () =>{
    return request(app)
    .get('/users/2/budget')
    .expect('Content-Type', /json/)
    .expect(200)
    .then((response) => {
      expect(response.body.budget).toBeGreaterThan(-1)
  })

  })

})

describe('\n/users\n', () => {

  it('GET --> returns an array of users', () => {
    return request(app)
    .get('/users')
    .expect('Content-Type', /json/)
    .expect(200)
    .then((response) => {
      expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: expect.any(String),
          id: expect.any(Number),
          name: expect.any(String),
          transactions: expect.any(Array),
        }),
      ])
      )
    })
  });

  it('POST --> creates a new user', () =>{
    return request(app)
    .post('/users')
    .expect('Content-Type', /json/)
    .send({
      name: "Jane Doe",
      email: "jane.doe@email.com",
      pwd: "senha1234"
    })
    .expect(201)
  })

  it('POST --> the user email should be unique', () =>{
    return request(app)
    .post('/users')
    .expect('Content-Type', /json/)
    .send({
      name: "John A. Richman",
      email: "john.ricHman@email.com",
      pwd: "senha1234"
    })
    .expect(400)
    .then((response) => {
      expect(response.body).toEqual(
        expect.objectContaining({
          error: "User is already registered"
        })
      )
    })
  })

  })

describe('\n/users/:id', () => {
  it('GET --> should return a user', () => {
    return request(app)
    .get('/users/2')
    .expect('Content-Type', /json/)
    .expect(200)
    .then((response) => {
      expect(response.body).toEqual(
        expect.objectContaining({
          name: "Angela Christina",
          email: "angela.christina@email.com"
        })
      )
    })
  });

  it('GET --> should return a 404 for non-existent users', () => {
    return request(app)
    .get('/users/9999999999999999999')
    .expect('Content-Type', /json/)
    .expect(404)
    .then((response) => {
      expect(response.body).toEqual(
        expect.objectContaining({
          error: "Unexistent user"
        })
      )
    })
  });
});
