import { v4 as UUIDV4 } from 'uuid';
import { Model, Column, Table, IsUUID, PrimaryKey, Default, ForeignKey, BelongsTo } from 'sequelize-typescript';

import { Group, WellnessAppUser } from './index';

@Table({ tableName: 'groupUser' })
export class GroupUser extends Model<GroupUser> {
    @IsUUID(4)
    @PrimaryKey
    @Default(UUIDV4)
    @Column
    id!: string;

    @ForeignKey(() => Group)
    @Column
    groupId!: string;

    @ForeignKey(() => WellnessAppUser)
    @Column
    userId!: string;

    // Associations
    @BelongsTo(() => WellnessAppUser)
    user!: ReturnType<() => WellnessAppUser>;

    @BelongsTo(() => Group)
    group!: ReturnType<() => Group>;
}
