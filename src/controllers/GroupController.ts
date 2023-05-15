import { Op, WhereOptions } from 'sequelize';

import { Group, GroupUser, Score, WellnessAppUser } from '../data/models';
import * as _ from 'lodash';
import { validation } from '../config/validation';
import { sequelize } from '../sequelize';
import { scoreTask } from '../tasks/ScoreTask';

export class GroupController {
    static async getAllGroups(req, res, next) {
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const groups = await Group.findAll({ where: { ownerId: 'a6abc042-8c22-49cd-acc0-5818964a9605' } });

            return res.status(200).json({ data: groups });
        } catch (e) {
            next(e);
        }
    }
    static async getGroup(req, res, next) {
        try {
            const { groupId: id } = req.params;
            // check owner
            const group = await Group.scope('groupUser').findByPk(id);

            if (_.isEmpty(group)) {
                return res.status(404).json({ message: 'Group not found' });
            }

            return res.status(200).json({ data: group });
        } catch (e) {
            next(e);
        }
    }
    static async getGroupScores(req, res, next) {
        try {
            const { groupId: id } = req.params;
            // check owner
            const group = await Group.findByPk(id);

            if (_.isEmpty(group)) {
                return res.status(404).json({ message: 'Group not found' });
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const users = await GroupUser.findAll({ where: { groupId: id } });

            const userIds = users.map(user => user.userId);

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const { rows: scores, count: total } = await Score.findAndCountAll({ where: { userId: userIds } });

            const scoreData = await scoreTask.createScoreResponseData(scores, total);

            return res.status(200).json({ data: scoreData });
        } catch (err) {
            next(err);
        }
    }
    static async getGroupScoresReports(req, res, next) {
        try {
            const { groupId: id } = req.params;
            const { startDate, endDate } = req.query;

            const group = await Group.scope('groupUser').findByPk(id);

            if (_.isEmpty(group)) {
                return res.status(404).json({ message: 'Group not found' });
            }

            const users = await GroupUser.findAll({ where: { groupId: id } as WhereOptions });

            const userIds = users.map(user => user.userId);

            const result: any = [];

            const start = new Date(startDate);
            const end = new Date(endDate);

            const daysCount = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 3600 * 24));

            for (let i = 0; i <= daysCount; i++) {
                let j = i;

                const day = new Date();
                const nextDay = new Date();

                day.setDate(day.getDate() - Math.abs(i - daysCount));
                nextDay.setDate(nextDay.getDate() + (++j - daysCount));

                const currentDayTimeString = day.toISOString().slice(0, 10) + 'T00:00:00.000Z';
                const nextDayTimeString = nextDay.toISOString().slice(0, 10) + 'T00:00:00.000Z';

                const { rows: scores, count: total } = await Score.findAndCountAll({
                    where: {
                        userId: userIds,
                        dateRecorded: { [Op.between]: [currentDayTimeString, nextDayTimeString] }
                    } as WhereOptions
                });

                console.log({ scores });

                const { mood, stress, moodScore, stressScore } = await scoreTask.createScoreResponseData(scores, total);

                result.push({ date: day, mood, stress, moodScore, stressScore });
            }

            return res.status(200).json({ data: result });
        } catch (err) {
            next(err);
        }
    }

    static async createGroup(req, res, next) {
        try {
            const { groupName = null, userIds = [] } = req.body;
            const { minCount } = validation.groupUsers;

            if (_.isEmpty(groupName) || _.isEmpty(userIds)) {
                return res.status(422).json({ message: 'NAME_AND_USERS_ARE_REQUIRED' });
            }

            const name = groupName.trim();

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const existingGroup = await Group.findOne({ where: { name }, attributes: ['name'], raw: true });

            if (!_.isEmpty(existingGroup)) {
                return res.status(422).json({ message: 'GROUP_NAME_MUST_BE_UNIQUE' });
            }

            if (userIds.length < minCount) {
                return res.status(422).json({ message: 'NOT_ENOUGH_USERS_TO_PROCEED_WITH_OPERATION' });
            }

            // replace count
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const users = await WellnessAppUser.findAll({ where: { id: userIds } });

            if (users.length < userIds.length) {
                return res.status(404).json({ message: 'USER_NOT_FOUND' });
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // const user: User = await User.findOne({
            //     where: { id: 'a6abc042-8c22-49cd-acc0-5818964a9605' },
            //     attributes: ['id'],
            //     raw: true
            // });

            const group = await sequelize.transaction(async transaction => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore

                const result = await Group.create({ name, ownerId: 'a6abc042-8c22-49cd-acc0-5818964a9605' });

                const { id: groupId } = result;

                await GroupUser.bulkCreate(
                    _.map(userIds, userId => ({ userId, groupId })),
                    { validate: true, transaction }
                );

                return result;
            });

            return res.status(201).json({ data: group });
        } catch (err) {
            next(err);
        }
    }
    static async updateGroup(req, res, next) {
        try {
            const { groupName = null, newUserIds = [] } = req.body;
            const { groupId: id } = req.params;

            const group = await Group.findByPk(id);

            if (_.isEmpty(group)) {
                return res.status(404).json({ message: 'Group not found' });
            }

            if (_.isEmpty(groupName) && _.isEmpty(newUserIds)) {
                return res.status(400).json({ message: 'MISSING_DATA_FOR_UPDATE' });
            }

            const name = groupName ? groupName.trim() : null;

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const existingGroup = name ? await Group.findOne({ where: { name }, attributes: ['name'], raw: true }) : {};

            if (!_.isEmpty(existingGroup)) {
                return res.status(422).json({ message: 'GROUP_NAME_MUST_BE_UNIQUE' });
            }

            // replace count
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const users = await WellnessAppUser.findAll({ where: { id: newUserIds } });

            if (users.length < newUserIds.length) {
                return res.status(400).json({ message: 'USER_NOT_FOUND' });
            }

            const existingUser = await GroupUser.findAll({ where: { userId: newUserIds } as WhereOptions });

            if (!_.isEmpty(existingUser)) {
                return res.status(400).json({ message: 'User is already a member of the group' });
            }

            if (group?.ownerId !== 'a6abc042-8c22-49cd-acc0-5818964a9605') {
                return res.status(403).json({ message: 'ACCESS_DENIED' });
            }

            await sequelize.transaction(async transaction => {
                if (!_.isEmpty(name)) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    await Group.update({ name }, { where: { id } });
                }

                if (!_.isEmpty(newUserIds)) {
                    await GroupUser.bulkCreate(
                        _.map(newUserIds, userId => ({ userId, groupId: id })),
                        { validate: true, transaction }
                    );
                }
            });

            const data = await Group.scope('groupUser').findByPk(id);

            return res.status(200).json({ data });
        } catch (err) {
            next(err);
        }
    }
    static async deleteGroup(req, res, next) {
        try {
            const { groupId } = req.params;

            const group = await Group.findOne({ where: { id: groupId } as WhereOptions });

            if (_.isEmpty(group)) {
                return res.status(404).json({ message: 'Group not found' });
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await group?.destroy();

            return res.status(202).json({});
        } catch (err) {
            next(err);
        }
    }
}
