const chalk = require("chalk");
const mongoose = require("mongoose");
var os = require('os-utils');
const SQLite = require("better-sqlite3")
const sql = new SQLite('./mainDB.sqlite')
const { join } = require("path")
const fs = require("fs");
const { mongoPass } = require("../../config.json"); 
module.exports = (client) => {

  const guildin = client.guilds.cache.size;
  const guildmember = client.users.cache.size;
  
 client.user.setPresence({ status: "online" });
let textList = [' About handling command',' in: ' + guildin + ' Server(s).' + ' Serving: ' + guildmember + ' member(s)',` Current Cpu core : ${os.cpuCount()}`]
 client.user.setPresence({ status: "online" });
 setInterval(() => {
   var text = textList[Math.floor(Math.random() * textList.length)];
  client.user.setActivity(text, { type: "WATCHING"});
}, 3000);

  let allMembers = new Set();
  client.guilds.cache.forEach((guild) => {
    guild.members.cache.forEach((member) => {
      allMembers.add(member.user.id);
    });
  });

  let allChannels = new Set();
  client.guilds.cache.forEach((guild) => {
    guild.channels.cache.forEach((channel) => {
      allChannels.add(channel.id);
    });
  });

  console.log(
    chalk.bgMagentaBright.black(` ${client.guilds.cache.size} servers `),
    chalk.bgMagentaBright.black(` ${client.channels.cache.size} channels `),
    chalk.bgMagentaBright.black(` ${allMembers.size} members `)
  );

  mongoose
    .connect(mongoPass, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then(
      console.log(
        chalk.bgGreenBright.black(
          ` ${client.user.username} connected to Mongo DB `
        )
      )
    )
    .catch((err) =>
      console.log(
        chalk.bgRedBright.black(
          ` ${client.user.username} could not connect to mongo DB `
        )
      )
    );
// Check if the table "points" exists.
    const levelTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'levels';").get();
    if (!levelTable['count(*)']) {
        sql.prepare("CREATE TABLE levels (id TEXT PRIMARY KEY, user TEXT, guild TEXT, xp INTEGER, level INTEGER, totalXP INTEGER);").run();
    }

    client.getLevel = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
    client.setLevel = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (@id, @user, @guild, @xp, @level, @totalXP);");

    // Check if the table "backgrounds" exists.
    const bgTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'background';").get();
    if (!bgTable['count(*)']) {
        sql.prepare("CREATE TABLE background (user TEXT, guild TEXT, bg TEXT)").run();
    }

    client.getBg = sql.prepare("SELECT bg FROM background WHERE user = ? AND guild = ?");
    client.setBg = sql.prepare("INSERT OR REPLACE INTO background (user, guild, bg) VALUES (@user, @guild, @bg);");

    // Role table for levels
    const roleTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'roles';").get();
    if (!roleTable['count(*)']) {
        sql.prepare("CREATE TABLE roles (guildID TEXT, roleID TEXT, level INTEGER);").run();
    }

    // Prefix table
    const prefixTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'prefix';").get();
    if (!prefixTable['count(*)']) {
        sql.prepare("CREATE TABLE prefix (serverprefix TEXT, guild TEXT PRIMARY KEY);").run();
    }

    // Blacklist table
    const blacklistTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'blacklistTable';").get();
    if (!blacklistTable['count(*)']) {
        sql.prepare("CREATE TABLE blacklistTable (guild TEXT, typeId TEXT, type TEXT, id TEXT PRIMARY KEY);").run();
    }



    const channelTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'channel';").get();
    if (!channelTable['count(*)']) {
        sql.prepare("CREATE TABLE channel (guild TEXT PRIMARY KEY, channel TEXT);").run();
    }
};
