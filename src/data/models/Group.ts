import { v4 as UUIDV4 } from 'uuid';
import { ForeignKey, Unique, AllowNull, HasMany } from 'sequelize-typescript';
import { Model, Column, Table, IsUUID, PrimaryKey, Default, BelongsTo, Scopes } from 'sequelize-typescript';

import { User, GroupUser, WellnessAppUser } from './index';

@Scopes(() => ({
    groupUser: {
        attributes: ['id', 'name', 'ownerId'],
        include: [
            {
                as: 'users',
                attributes: ['id'],
                model: GroupUser,
                include: [{ model: WellnessAppUser, as: 'user', attributes: ['id', 'email'] }]
            }
        ]
    }
}))
@Table({ tableName: 'group' })
export class Group extends Model<Group> {
    @IsUUID(4)
    @PrimaryKey
    @Default(UUIDV4)
    @Column
    id!: string;

    @AllowNull(false)
    @Unique
    @Column
    name!: string;

    @ForeignKey(() => User)
    @Column
    ownerId!: string;

    // Associations
    @BelongsTo(() => User)
    owner!: ReturnType<() => User>;

    @HasMany(() => GroupUser)
    users!: ReturnType<() => GroupUser[]>;
}
