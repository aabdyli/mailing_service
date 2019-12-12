import { Consumer } from 'sqs-consumer'
import * as dotenv from 'dotenv'
import nodemailer, { SentMessageInfo } from 'nodemailer'

dotenv.config()

import mongoose from 'mongoose'
import MailLog from './models/MailLog'
import Order from './models/Order'

if (process.env.MONGOLAB_URI) {
  mongoose.connect(process.env.MONGOLAB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log(`MongoDB Connected sucessfully`))
    .catch(error => console.error(error))
}

const queue = process.env.QUEUE_ENDPOINT || ''

const app = Consumer.create({
  queueUrl: queue,
  handleMessage: async (message) => {
    // do some work with `message`
  }
})

const host: string = process.env.MAIL_HOST || 'smtp.mailtrap.io'
const port: number = Number(process.env.MAIL_PORT) || 2525
const user: string = process.env.MAIL_USER || ''
const pass: string = process.env.MAIL_PASS || ''

const mailer = nodemailer.createTransport({
  host,
  port,
  auth: {
    user,
    pass
  }
})

app.on('error', (err) => {
  console.error(err.message);
});

app.on('processing_error', (err) => {
  console.error(err.message);
});

app.on('message_received', async (data) => {
  try {
    const order = await Order.findById(data.Body).exec()
    if (order === null) {
      console.error(`Order not Found`)
      return
    }
    mailer.sendMail({
      from: 'microservice@test.org',
      to: order.userEmail,
      subject: `Order ${order.orderId} Confirmation`,
      text: order.products.reduce((acc, curr) => acc + ' ' + curr, '')
    }).then(() => {
      MailLog.create({
        orderId: order.orderId,
        emailSent: true
      }).catch(err => console.error(`The MailLog could not be saved ${err}, Order ID: ${order.orderId}`))
    })
      .catch(err => console.error(`The eMail could not be sent. Error: ${err}`))
  } catch (error) {
    console.error(`Error on retrieving order from the DB. Error: ${error}`)
  }
})

app.on('message_processed', (data) => {
  console.log(`Message sent successfully for Order ${data.Body}`)
})

app.start()