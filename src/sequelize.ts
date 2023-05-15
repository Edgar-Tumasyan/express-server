import { Sequelize } from 'sequelize-typescript';

import * as database from './config/database.js';
import { Score, WellnessAppUser, Group, GroupUser, User, Organization, OrganizationUser } from './data/models';

export const sequelize = new Sequelize({
    ...database,
    models: [User, Group, GroupUser, Score, WellnessAppUser, Organization, OrganizationUser]
});
