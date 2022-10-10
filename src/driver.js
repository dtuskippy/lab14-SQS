'use strict';

const { Consumer } = require('sqs-consumer');
const { Producer } = require('sqs-producer');
const Chance = require('chance');
const chance = new Chance();

const app = Consumer.create({
  queueUrl: 'https://sqs.us-west-2.amazonaws.com/972392329703/lab14-SQS.fifo',
  handleMessage: confirmPickup,
});

async function confirmPickup(Records) {
  console.log('Picked up package');
  try {
    console.log('Package delivered');
    const body = JSON.parse(Records.Body);
    const order = JSON.parse(body.Message);

    const producer = Producer.create({
      queueUrl: order.queueUrl,
      region: 'us-west-2',
    });

    const stringifiedMessage = JSON.stringify({
      ...order,
      deliveredMessage: `${order.orderId} has been delivered`,
      deliveredBool: true,
    });

    const payload = {
      id: chance.guid(),
      body: stringifiedMessage,
    };

    await producer.send(payload);

    console.log('Payload sent to SQS');
  } catch (error) {
    console.error(error);
  }
}

app.start();

console.log('App has started');