import BullQueue from 'bull';
import * as jobs from '../app/jobs';
import redisConfig from '../config/redis';

class Queue {
    constructor() {
        this.queues = {};
        this.init();
    }

    init() {
        this.queues = Object.values(jobs).map(job => ({
            bull: new BullQueue(job.key, redisConfig),
            name: job.key,
            handle: job.handle,
            options: job.options,
        }));
    }

    add(name, data) {
        const queue = this.queues.find(queueFind => queueFind.name === name);
        return queue.bull.add(data, queue.options);
    }

    process() {
        return this.queues.forEach(queue => {
            queue.bull.process(queue.handle);

            // TODO add sentry para capturar o log de erro do job.
            queue.bull.on('failed', (job, err) => {
                console.log('Job failed', queue.key, job.data);
                console.log(err);
            });
        });
    }
}

export default new Queue();
