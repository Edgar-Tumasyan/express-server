import * as _ from 'lodash';
import { v4 as UUIDV4 } from 'uuid';
import { Model, Column, Table, IsUUID } from 'sequelize-typescript';
import { PrimaryKey, Default, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript';

import { StressScoreDataType, MoodScoreDataType, AssessmentAccurateType } from '../lcp';
import { WellnessAppUser } from './index';

@Table({ tableName: 'score' })
export class Score extends Model<Score> {
    @IsUUID(4)
    @PrimaryKey
    @Default(UUIDV4)
    @Column
    id!: string;

    @ForeignKey(() => WellnessAppUser)
    @AllowNull(false)
    @IsUUID(4)
    @Column
    userId!: string;

    @AllowNull(false)
    @Column
    assessmentId!: string;

    @AllowNull(false)
    @Column
    dateRecorded!: string;

    @AllowNull(false)
    @Column
    stressId!: string;

    @AllowNull(false)
    @Column({ type: 'enum', values: _.values(StressScoreDataType) })
    stressScoreData!: string;

    @AllowNull(false)
    @Column
    moodId!: string;

    @Column({ type: 'enum', values: _.values(MoodScoreDataType) })
    moodScoreData!: string;

    @AllowNull(false)
    @Column
    power!: string;

    @AllowNull(false)
    @Column
    speed!: string;

    @AllowNull(false)
    @Column
    dynamics!: string;

    @AllowNull(false)
    @Column
    energyId!: string;

    @AllowNull(false)
    @Column
    energyOverall!: string;

    @Column
    feedBackText!: string;

    @Column({ type: 'enum', values: _.values(AssessmentAccurateType) })
    isAssessmentAccurate!: string;

    // Associations

    @BelongsTo(() => WellnessAppUser)
    user!: ReturnType<() => WellnessAppUser>;
}
