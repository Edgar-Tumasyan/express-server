import { Router } from 'express';

import { ScoreController } from '../controllers/ScoreController';

export const score = Router();

score.get('/', ScoreController.getScores);

score.get('/reports', ScoreController.getScoresReports);
