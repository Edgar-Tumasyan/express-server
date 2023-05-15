import * as _ from 'lodash';
import { Router } from 'express';

import { GroupController } from '../controllers/GroupController';

export const groups = Router();

groups.get('/', GroupController.getAllGroups);
groups.get('/:groupId', GroupController.getGroup);
groups.get('/:groupId/scores', GroupController.getGroupScores);
groups.get('/:groupId/scores/reports', GroupController.getGroupScoresReports);

groups.post('/', GroupController.createGroup);

groups.put('/:groupId', GroupController.updateGroup);

groups.delete('/:groupId', GroupController.deleteGroup);
