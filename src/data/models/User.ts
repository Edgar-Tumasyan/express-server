import * as _ from 'lodash';
import { v4 as UUIDV4 } from 'uuid';
import { Model, Column, Table, IsUUID, PrimaryKey, Default, Scopes, HasOne, HasMany } from 'sequelize-typescript';

import { Group, Organization, OrganizationUser } from './index';
import { UserGenderType } from '../lcp';

@Scopes(() => ({
    organization: {
        include: [
            {
                as: 'organizationUser',
                model: OrganizationUser,
                include: [{ model: Organization, as: 'organization' }]
            }
        ]
    }
}))
@Table({ tableName: 'user' })
export class User extends Model<User> {
    @IsUUID(4)
    @PrimaryKey
    @Default(UUIDV4)
    @Column
    id!: string;

    @Column
    name!: string;

    @Column
    email!: string;

    @Column
    nickname!: string;

    @Column
    lastName!: string;

    @Column
    firstName!: string;

    @Column
    dateOfBirth!: Date;

    @Column
    principalId!: string;

    @Column({
        type: 'enum',
        values: _.values(UserGenderType)
    })
    gender!: string;

    // Associations
    @HasOne(() => OrganizationUser)
    organizationUser!: ReturnType<() => OrganizationUser>;

    @HasMany(() => Group)
    groups!: ReturnType<() => Group[]>;
}
