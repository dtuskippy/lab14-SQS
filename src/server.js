'use strict';

const Chance = require('chance');
const chance = new Chance();
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });
const { Consumer } = require('sqs-consumer');

function publishPickup() {
  let newOrderString = JSON.stringify({
    orderId: chance.guid(),
    customer: chance.name(),
    queueArn: 'arn:aws:sqs:us-west-2:972392329703:lab14-SQS.fifo',
    queueUrl: 'https://sqs.us-west-2.amazonaws.com/972392329703/lab14-SQS.fifo',
  });

  const sns = new AWS.SNS();

  const payload = {
    Message: newOrderString,
    TopicArn: 'arn:aws:sns:us-west-2:972392329703:newOrder.fifo',
    MessageDeduplicationId: newOrderString.orderId,
    MessageGroupId: 'driver1',
  };

  sns.publish(payload).promise()
    .then((response) => {
      console.log(`--- New Order Added to Queue ---\n ${payload.Message} \n`);
    })
    .catch(console.error);
}

publishPickup();

setInterval(publishPickup, 10000);

const app = Consumer.create({
  queueUrl: 'https://sqs.us-west-2.amazonaws.com/972392329703/lab14-SQS.fifo',
  handleMessage: handleDelivered,
});

function handleDelivered(Records) {
  try {
    const order = JSON.parse(Records.Body);
    console.log(`\n Order \n${order.Message}\n --------\nhas been delivered\n`);
  } catch (error) {
    console.error(error);
  }
}

app.start();

console.log('Server is running -- Resuming adding orders to queue...');