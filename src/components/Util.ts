import { Op, WhereOptions } from 'sequelize';

import { AssessmentAccurateType, MoodScoreDataType, StressScoreDataType } from '../data/lcp';
import { ConfidenceLevel, MoodScoreDataValue, StressScoreDataValue } from '../constants';
import { Score } from '../data/models';

class Util {
    async getScoreData(scores: Array<any>, total: number) {
        const { LOW: STRESS_LOW, MEDIUM, HIGH } = StressScoreDataType;
        const { LOW: MOOD_LOW, GOOD, EXCELLENT } = MoodScoreDataType;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { low: stress_low, medium } = StressScoreDataValue;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { low: mood_low, good } = MoodScoreDataValue;

        let moodScore = 0;
        let stressScore = 0;

        let accurateCount = 0;
        let notAccurateCount = 0;
        let assessmentAccurateCount = 0;

        for (const score of scores) {
            const { stressScoreData, moodScoreData, isAssessmentAccurate } = score;

            moodScore += Number(MoodScoreDataValue[moodScoreData]);
            stressScore += Number(StressScoreDataValue[stressScoreData]);

            if (isAssessmentAccurate) {
                assessmentAccurateCount++;
                if (isAssessmentAccurate === AssessmentAccurateType.AGREE) {
                    accurateCount++;
                } else {
                    notAccurateCount++;
                }
            }
        }

        moodScore /= total;
        stressScore /= total;

        const mood = moodScore <= mood_low ? MOOD_LOW : moodScore <= good ? GOOD : EXCELLENT;

        const stress = stressScore <= stress_low ? STRESS_LOW : stressScore <= medium ? MEDIUM : HIGH;

        const assessmentAccuratePercent = (accurateCount / assessmentAccurateCount) * 100;

        const assessmentAccurate =
            assessmentAccuratePercent <= 32.4
                ? ConfidenceLevel.POOR
                : assessmentAccuratePercent <= 64.9
                ? ConfidenceLevel.GOOD
                : assessmentAccuratePercent <= 82.4
                ? ConfidenceLevel.EXCELLENT
                : ConfidenceLevel.FAIR;

        return {
            mood,
            stress,
            moodScore,
            stressScore,
            accurateCount,
            notAccurateCount,
            assessmentAccurate,
            assessmentAccuratePercent
        };
    }

    async getDateData() {
        const daysData = [];
        let currentDayTotal = 0;

        const currentDay = new Date().getDay();

        const DaysOfWeek = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            0: 'Sunday',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            1: 'Monday',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            2: 'Tuesday',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            3: 'Wednesday',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            4: 'Thursday',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            5: 'Friday',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            6: 'Saturday'
        };

        for (let i = 0; i <= 6; i++) {
            let j = i;
            const currentDate = new Date();

            const day = new Date(currentDate);
            const nextDay = new Date(currentDate);

            day.setDate(currentDate.getDate() - Math.abs(i - currentDay));
            nextDay.setDate(currentDate.getDate() + (++j - currentDay));

            const currentDayTimeString = day.toISOString().slice(0, 10) + 'T00:00:00.000Z';
            const nextDayTimeString = nextDay.toISOString().slice(0, 10) + 'T00:00:00.000Z';

            const count =
                i > currentDay
                    ? null
                    : await Score.count({
                          where: {
                              dateRecorded: { [Op.between]: [currentDayTimeString, nextDayTimeString] }
                          } as WhereOptions
                      });

            if (i === currentDay) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                currentDayTotal = count;
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            daysData.push({ name: DaysOfWeek[i], value: count });
        }

        const currentDate = new Date();

        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

        const currentMonthString = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01T00:00:00.000Z`;
        const nextMonthString = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01T00:00:00.000Z`;

        const currentMonthTotal = await Score.count({
            where: { dateRecorded: { [Op.between]: [currentMonthString, nextMonthString] } } as WhereOptions
        });

        const allTime = await Score.count();

        return { daysData, allTime, currentMonthTotal, currentDayTotal };
    }
}
export const util = new Util();
