import * as _ from 'lodash';

import { IScoreResponseData, IScoreData, ScoreResult } from '../interfaces';
import { util } from '../components/Util';
import { EventName } from '../constants';

class ScoreTask {
    async createScoreData(scoreData): Promise<IScoreData> {
        const { INSERT } = EventName;

        const createData = [];
        const updateData = [];

        for (const score of scoreData) {
            const data = _.get(score, 'dynamodb.NewImage.results.L', []);

            const moodOverallData = !_.isEmpty(data[0]?.M?.Mood_Overall) ? data[0] : data[1];
            const stressData = !_.isEmpty(data[0]?.M?.Stress_Overall) ? data[0] : data[1];
            const energyScoresData = data[2];

            const result: ScoreResult = {
                userId: _.get(data, 'dynamodb.NewImage.pk.S', null).slice(5),
                assessmentId: _.get(data, 'dynamodb.NewImage.sk.S', null).slice(11),
                dateRecorded: _.get(data, 'dynamodb.NewImage.dateRecorded.S', null),

                stressId: _.get(stressData, 'M.Stress_Overall.M.uuid.S', null),
                stressScoreData: _.get(stressData, 'M.Stress_Overall.M.scoreData.M.data.S', null),

                moodId: _.get(moodOverallData, 'M.Mood_Overall.M.uuid.S', null),
                moodScoreData: _.get(moodOverallData, 'M.Mood_Overall.M.scoreData.M.data.S', null),

                energyId: _.get(energyScoresData, 'M.Energy_Scores.M.uuid.S', null),
                power: _.get(energyScoresData, 'M.Energy_Scores.M.scoreData.M.data.M.power.N', null),
                speed: _.get(energyScoresData, 'M.Energy_Scores.M.scoreData.M.data.M.speed.N', null),
                dynamics: _.get(energyScoresData, 'M.Energy_Scores.M.scoreData.M.data.M.dynamics.N', null),
                energyOverall: _.get(energyScoresData, 'M.Energy_Scores.M.scoreData.M.data.M.overall.N', null),

                feedBackText: _.get(data, 'dynamodb.NewImage.assessmentFeedback.M.feedbackText.S', null),
                isAssessmentAccurate: _.get(data, 'dynamodb.NewImage.assessmentFeedback.M.isAssessmentAccurate.S', null)
            };

            if (score.eventName === INSERT) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                createData.push(result);
            } else {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                updateData.push(result);
            }
        }

        return { createData, updateData };
    }

    async createScoreResponseData(scores: Array<any>, total): Promise<IScoreResponseData> {
        const scoreData = await util.getScoreData(scores, total);

        const { accurateCount, notAccurateCount, assessmentAccuratePercent } = scoreData;
        const { mood, stress, moodScore, stressScore, assessmentAccurate } = scoreData;

        const { daysData, allTime, currentMonthTotal, currentDayTotal } = await util.getDateData();

        return {
            mood,
            stress,
            allTime,
            daysData,
            moodScore,
            stressScore,
            accurateCount,
            currentDayTotal,
            notAccurateCount,
            currentMonthTotal,
            assessmentAccurate,
            assessmentAccuratePercent
        };
    }
}

export const scoreTask = new ScoreTask();
