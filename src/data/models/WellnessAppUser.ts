import { v4 as UUIDV4 } from "uuid";
import { Model, Column, Table, IsUUID, PrimaryKey, Default, AllowNull, HasMany } from "sequelize-typescript";
import { GroupUser } from "./GroupUser";

@Table({ tableName: "wellnessAppUser" })
export class WellnessAppUser extends Model<WellnessAppUser> {
  @IsUUID(4)
  @PrimaryKey
  @Default(UUIDV4)
  @Column
  id!: string;

  @AllowNull(false)
  @Column
  email!: string;

  // Associations

  @HasMany(() => GroupUser)
  groups!: ReturnType<() => GroupUser[]>;
}
