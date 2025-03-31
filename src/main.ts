import { Queue, Worker } from 'bullmq';

// const myQueue = new Queue(
//   'foo',
//   {
//     connection: {
//       host: "127.0.0.1",
//       port: 6379,
//     }
//   }
// );
//
// async function addJobs() {
//   await myQueue.add('myJobName', { foo: 'bar' });
//   await myQueue.add('myJobName', { qux: 'baz' });
// }
//
// await addJobs();
//
// const worker = new Worker(
//   'foo',
//   async job => {
//     // Will print { foo: 'bar'} for the first job
//     // and { qux: 'baz' } for the second.
//     console.log("i will run a job");
//
//     console.log("")
//
//     console.log(job.data);
//   },
//   {
//     connection: {
//       host: "127.0.0.1",
//       port: 6379,
//     }
//   },
// );

import fs from 'node:fs/promises';

try {
  const data = await fs.readFile('./config.json', { encoding: 'utf8' });
  console.log(data);
} catch (err) {
  console.error(err);
}