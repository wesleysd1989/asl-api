import 'dotenv/config';

import Queue from './lib/Queue';
import './database';

Queue.process();
