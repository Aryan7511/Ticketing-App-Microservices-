import mongoose from 'mongoose';
import request from 'supertest';
import { OrderStatus } from '@sswaptickets/common';
import { app } from '../../app';
import { Order } from '../../models/order';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

it('return a 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'jdfhdfdkjfd',
      orderId: new mongoose.Types.ObjectId().toHexString()
    })
    .expect(404);
});

it('return a 401 when purchasing an order that doesnt belong to the user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'jdfhdfdkjfd',
      orderId: order.id
    })
    .expect(401);
});

it('return a 400 when purchasing a cancelled order', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'jdfhdfdkjfd',
      orderId: order.id
    })
    .expect(400);
});

it('returns a 201 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);

  // console.log(price);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created
  });
  await order.save();

  const response = await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id
    })
    .expect(201);

  const payment = await stripe.paymentIntents.list({ limit: 50 });
  const stripePayment = payment.data.find((payment) => {
    return payment.amount === price * 100;
  });

  expect(stripePayment).toBeDefined();
  expect(stripePayment!.currency).toEqual('usd');

  const paymentFromDb = await Payment.findOne({
    orderId: order.id,
    stripeId: stripePayment!.id
  });

  expect(paymentFromDb).not.toBeNull();
});
