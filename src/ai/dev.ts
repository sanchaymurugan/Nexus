'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/ai-service-interaction.ts';
import '@/ai/flows/adaptive-headline-generation.ts';