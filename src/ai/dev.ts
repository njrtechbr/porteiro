import {config} from 'dotenv';
config();

import {ai} from './genkit';
import './flows/generate-terms-of-service';

export * from './flows/generate-terms-of-service';
