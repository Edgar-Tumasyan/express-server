export interface IScoreResponseData {
    mood: string;
    stress: string;
    allTime: number;
    moodScore: number;
    stressScore: number;
    daysData: Array<any>;
    accurateCount: number;
    currentDayTotal: number;
    notAccurateCount: number;
    currentMonthTotal: number;
    assessmentAccurate: string;
    assessmentAccuratePercent: number;
}
