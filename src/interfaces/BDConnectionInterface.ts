import * as Sequelize from 'sequelize'
import { ModelsInterface } from './ModelsInterface';

export interface DBConnection extends ModelsInterface{
    sequelize: Sequelize.Sequelize
}