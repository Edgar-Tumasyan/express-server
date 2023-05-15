import { v4 as UUIDV4 } from "uuid";
import { Model, Column, Table, IsUUID, PrimaryKey, Default, ForeignKey, BelongsTo } from "sequelize-typescript";

import { User } from "./User";
import { Organization } from "./Organization";

@Table({ tableName: "organizationUser" })
export class OrganizationUser extends Model<OrganizationUser> {
  @IsUUID(4)
  @PrimaryKey
  @Default(UUIDV4)
  @Column
  id!: string;

  @ForeignKey(() => User)
  @Column
  userId!: string;

  @ForeignKey(() => Organization)
  @Column
  organizationId!: string;

  // Associations
  @BelongsTo(() => User)
  user!: ReturnType<() => User>;

  @BelongsTo(() => Organization)
  organization!: ReturnType<() => Organization>;
}
