const express = require('express');
const Sequelize = require('sequelize');
const configs = require("../Confs/MysqlConf");
const config = configs.Production;
const Type = require("../Confs/TypeConf");

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    // timezone: '+08:00',
    logging: false,
    pool: {
        max: 5,
        min: 0,
        idle: 30000
    }
});


module.exports = {
    //NOTE:用户表
    user: sequelize.define("user", {
        //用户ID
        userID: {
            type: Type.TYPE_INT,
            primaryKey: true,
            autoIncrement: true,
            comment: "用户ID"
        },
        //用户手机号
        userTel: {
            type: Type.TYPE_VARCHAR,
            comment: "用户手机号",
            allowNull: false
        },
        //用户密码
        userPassWord: {
            type: Type.TYPE_VARCHAR,
            comment: "用户密码",
            allowNull: false
        }
    }, {
        comment: "用户表"
    })
};