import mongoose, { Schema, Document } from 'mongoose'

export interface IMail extends Document {
  orderId: string,
  emailSent: Boolean
}

const MailSchema = new Schema({
  orderId: { type: String, required: true },
  emailSent: { type: Boolean }
})

const MailLog = mongoose.model<IMail>('MailLog', MailSchema)

export default MailLog