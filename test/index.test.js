const request = require('supertest')
const app = require('../src/index')

describe('Users', ()=>{


  it('GET /users/:id/budget --> shows user\'s money (in cents) available to use on auctions', () =>{
    return request(app)
    .get('/users/1/budget')
    .expect('Content-Type', /json/)
    .expect(200)
    .then((response) => {
      expect(response.body.budget).toBe(26000)
    })
  })

  it('GET /users/:id/budget --> should be a number', () =>{
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

  it('GET /users/:id/budget --> should not be negative', () =>{
    return request(app)
    .get('/users/2/budget')
    .expect('Content-Type', /json/)
    .expect(200)
    .then((response) => {
      expect(response.body.budget).toBeGreaterThan(-1)
  })

  })

})
