const Discord = require("discord.js");
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');

module.exports = {
    name: 'levelupmessage',
    aliases: ['levelup', 'levelmessage', 'level-message'],
    category: "Leveling",
    description: "Set custom level up message!",
    cooldown: 3,
    "options": [
        {
            "name": "message",
            "description": "The level up message to set",
            // Type of input from user: https://discord.com/developers/docs/interactions/slash-commands#applicationcommandoptiontype
            "type": 3,
            "required": true,
        }
    ],   
    run: async(client, interaction, args)=> {
        if(!interaction.member.permissions.has("MANAGE_GUILD")) return interaction.reply(`You do not have permission to use this command!`);

        interaction.client.getLevel = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
        const level = interaction.client.getLevel.get(interaction.user.id, interaction.guild.id) 
        if(!level) {
            let insertLevel = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (?,?,?,?,?,?);");
            insertLevel.run(`${interaction.user.id}-${interaction.guild.id}`, interaction.user.id, interaction.guild.id, 0, 0, 0)
            return;
        }

        let antonymsLevelUp = (string) => {
            return string
              .replace(/{member}/i, `${interaction.member}`)
              .replace(/{xp}/i, `${level.xp}`)
              .replace(/{level}/i, `${level.level}`)
        }

        let checkIf = sql.prepare("SELECT levelUpMessage FROM settings WHERE guild = ?").get(interaction.guild.id);
        if(checkIf) {
            sql.prepare(`UPDATE settings SET levelUpMessage = ? WHERE guild = ?`).run(interaction.options.getString("message"), interaction.guild.id);
        } else {args
            sql.prepare(`INSERT OR REPLACE INTO settings (guild, levelUpMessage, customXP, customCooldown) VALUES (?,?,?,?)`).run(interaction.guild.id, interaction.options.getString("message"), 16, 1000);
        }
        
        return interaction.reply(`The level up message has been set to ${antonymsLevelUp(interaction.options.getString("message"))}!`);
    }
}