import express, { Request, Response } from 'express';

const app = express()

app.get('/ads', (request: Request, response: Response) => {
  return response.json({
    message: 'Uma mensagem qualquer'
  })
})

app.listen(3333)