/**
 * Created by tom on 2017/6/8.
 */
const Sequelize = require('sequelize');

//数据库类别
const Type = {
    TYPE_INT:Sequelize.INTEGER,
    TYPE_VARCHAR:Sequelize.STRING,
    TYPE_TEXT:Sequelize.TEXT,
    TYPE_DOUBLE:Sequelize.DOUBLE,
    TYPE_DECIMAL:Sequelize.DECIMAL(10, 2),
    TYPE_DATE:Sequelize.DATE
};
module.exports = Type;