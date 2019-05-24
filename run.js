import Chance from 'chance';

const chance = Chance();

const iterationsPerSimulation = 100;
const timePerIteration = 36000; // secs

const getCustomerArrivingProb = t => 1 - Math.pow(Math.E, - t/100);

const getTellerServingTime = (alpha, beta) => {
  const x = chance.floating({ min: 0, max: 1 });
  return 100 * Math.pow(x, alpha - 1) * Math.pow(1 - x, beta - 1);
};

const avg = arr => arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;

const runIteration = (alpha, beta, timeLength) => {
  const finalWaitTimes = [];
  const queueLengths = [];
  let customerQueue = [];
  let customerArrIdleTime = 0;
  let tellerRemainingTime = 0;
  Array(timeLength).fill(null).map(() => {
    // handle customer arriving.
    const customerArrivingProb = getCustomerArrivingProb(customerArrIdleTime);
    const isCustomerArriving = chance.bool({ likelihood: customerArrivingProb * 100 });
    if (isCustomerArriving) {
      customerQueue.push(0);
      customerArrIdleTime = 0;
    } else {
      customerArrIdleTime ++;
    }

    // hendle teller serving.
    if (tellerRemainingTime > 0) {
      tellerRemainingTime --;
    }
    if (tellerRemainingTime === 0 && customerQueue.length > 0) {
      let customerWaitedTime = customerQueue.shift();
      finalWaitTimes.push(customerWaitedTime);
      tellerRemainingTime = Math.ceil(getTellerServingTime(alpha, beta));
    }

    // all customers in line: wait time + 1
    customerQueue = customerQueue.map(waitTime => waitTime + 1);

    // keep track of current queue length
    queueLengths.push(customerQueue.length);
  });

  return {
    avgWaitTime: avg(finalWaitTimes),
    maxWaitTime: Math.max(...finalWaitTimes),
    avgQueueLength: avg(queueLengths),
    maxQueueLength: Math.max(...queueLengths),
  };
};

const runSimulation = (alpha, beta, timeLength, iterations) => {
  const results = Array(iterations).fill(0).map(() => runIteration(alpha, beta, timeLength));
  const avgWaitTime = avg(results.map(r => r.avgWaitTime));
  const maxWaitTime = Math.max(...results.map(r => r.maxWaitTime));
  const avgQueueLength = avg(results.map(r => r.avgQueueLength));
  const maxQueueLength = Math.max(...results.map(r => r.maxQueueLength));
  console.log(`avg. waiting time: ${avgWaitTime.toFixed(2)}; max waiting time: ${maxWaitTime}; diff: ${(maxWaitTime - avgWaitTime).toFixed(2)}`);
  console.log(`avg. queue length: ${avgQueueLength.toFixed(2)}; max queue length: ${maxQueueLength}; diff: ${(maxQueueLength - avgQueueLength).toFixed(2)}`);
}

console.log('yellow customer:');
runSimulation(2, 5, timePerIteration, iterationsPerSimulation);
console.log('=================');

console.log('red customer:');
runSimulation(2, 2, timePerIteration, iterationsPerSimulation);
console.log('=================');

console.log('blue customer:');
runSimulation(5, 1, timePerIteration, iterationsPerSimulation);
console.log('=================');
