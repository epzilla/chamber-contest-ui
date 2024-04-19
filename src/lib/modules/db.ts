import { Sequelize, type Options } from 'sequelize';
import mysql2 from 'mysql2';
import { env } from '$env/dynamic/private';

const options: Options = {
	database: env.DB_NAME,
	port: parseInt(env.DB_PORT!),
	username: env.DB_USER,
	password: env.DB_PASS,
	host: env.DB_HOST,
	dialect: 'mysql'
};

if (options.dialect === 'mysql') {
	options.dialectModule = mysql2;
}

export const db = new Sequelize(options);
