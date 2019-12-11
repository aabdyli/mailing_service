import mongoose, {Schema, Document} from 'mongoose'

export interface IOrder extends Document {
  products: [string],
  userId: string,
  userEmail: string,
  address: string,
  orderId?: string
}

const OrderSchema = new Schema({
  products: {type: [String], required: true},
  userId: {type: String, required: true},
  userEmail: {type: String, required: true},
  address: {type: String, required: true},
  orderId: {type: String}
})

const Order = mongoose.model<IOrder>('Order', OrderSchema)

export default Order
