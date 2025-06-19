import { Sequelize } from 'sequelize';

const sequelize = new Sequelize("sqlite:../storage.db");

export default sequelize;