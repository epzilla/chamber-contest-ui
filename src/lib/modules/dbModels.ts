import { DataTypes } from 'sequelize';
import { db } from './db';

export const Members = db.define(
	'Members',
	{
		id: {
			field: 'id',
			type: DataTypes.INTEGER,
			allowNull: true,
			autoIncrement: true,
			primaryKey: true
		},
		name: {
			field: 'name',
			type: DataTypes.STRING,
			allowNull: false
		},
		email: {
			field: 'email',
			type: DataTypes.STRING,
			allowNull: false
		},
		isActive: {
			field: 'is_active',
			type: DataTypes.BOOLEAN,
			allowNull: false
		},
		isAdmin: {
			field: 'is_admin',
			type: DataTypes.BOOLEAN,
			allowNull: false
		}
	},
	{
		tableName: 'members',
		timestamps: false,
		freezeTableName: true
	}
);
