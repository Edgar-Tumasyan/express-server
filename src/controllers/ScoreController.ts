import { Op, WhereOptions } from 'sequelize';

import { util } from '../components/Util';
import { Score } from '../data/models';
import * as _ from 'lodash';

export class ScoreController {
    static async getScores(req, res, next) {
        try {
            const { rows: scores, count: total } = await Score.findAndCountAll();

            if (_.isEmpty(scores)) {
                return res.status(404).json({ message: 'Scores not found' });
            }

            const data = util.getScoreData(scores, total);
            // const data = await util.createScoreResponseData(scores, total);
            res.status(200).json(data);
        } catch (e) {
            next(e);
        }
    }

    static async getScoresReports(req, res, next) {
        try {
            const { startDate, endDate } = req.body;

            const daysData: any = [];

            const start = new Date(startDate);
            const end = new Date(endDate);

            const daysCount = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 3600 * 24));

            for (let i = 0; i <= daysCount; i++) {
                let j = i;
                const prevDate = new Date();
                const nextDate = new Date();
                prevDate.setDate(prevDate.getDate() - Math.abs(i - daysCount));
                nextDate.setDate(nextDate.getDate() + (++j - daysCount));

                const currentDateTimeString = prevDate.toISOString().slice(0, 10) + 'T00:00:00.000Z';
                const nextDateTimeString = nextDate.toISOString().slice(0, 10) + 'T00:00:00.000Z';

                const { rows: scores, count: total } = await Score.findAndCountAll({
                    where: {
                        dateRecorded: { [Op.between]: [currentDateTimeString, nextDateTimeString] }
                    } as WhereOptions
                });

                const { mood, stress, moodScore, stressScore } = await util.getScoreData(scores, total);

                daysData.push({ date: prevDate, mood, stress, moodScore, stressScore });
            }

            res.status(200).json(daysData);
        } catch (e) {
            next(e);
        }
    }
}
