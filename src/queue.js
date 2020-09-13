import 'dotenv/config';

import SendEvent from './app/jobs/SendEvent';
import Queue from './lib/Queue';
import './database';

Queue.process();
Queue.add(SendEvent.key);
