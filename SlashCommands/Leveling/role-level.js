const Discord = require("discord.js");
const config = require('../../config.json') 
const prefix = config.prefix;
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');

module.exports = {
    name: 'role-level',
    aliases: ['rlevel', 'level-roles'],
    description: "Rewards role when user leveled up to a certain level",
    category: "Leveling",
    "options": [
        {
            "name": "level",
            "description": "The level to tie a role to",
            // Type of input from user: https://discord.com/developers/docs/interactions/slash-commands#applicationcommandoptiontype
            "type": 4,
            "required": false,
        },
        {
            "name": "role",
            "description": "The role of which the aforementioned level is tied to",
            "type": 8,
            "required": false
        }
    ],    
    cooldown: 3,
    run: async(client, interaction, args)=> {

        await interaction.deferReply();

        if(!interaction.guild.me.permissions.has("MANAGE_ROLES")) interaction.editReply(`I do not have permission to manage roles!`);
        if(!interaction.member.permissions.has("MANAGE_ROLES") || !interaction.member.permissions.has("MANAGE_GUILD")) return interaction.reply(`You do not have permission to use this command!`);


        if(!interaction.options.getInteger("level")) {
            let embed = new Discord.MessageEmbed()
                .setTitle(`Leveling Roles Setup`)
                .setDescription(`Rewards role when user leveled up to a certain level`)
                .addFields({ name: `${prefix}role-level add <level> <@role>`, value: `Sets a role to be given to user when they leveled up to certain level.`})
                .addFields({ name: `${prefix}role-level remove <level>`, value: `Removes the role set at the specified level.`})
                .addFields({ name: `${prefix}role-level show`, value: `Shows all roles set to levels.`})
                .setColor("#5AC0DE");

            return interaction.channel.send({embeds: [embed]});
        }

        if(!interaction.options.getRole("role")) {
            method = "show";
        } else { 
            method = "add";
        }

        const levelArgs = interaction.options.getInteger("level");
        const role = interaction.options.getRole("role");

        interaction.client.getRole = sql.prepare("SELECT * FROM roles WHERE guildID = ? AND roleID = ? AND level = ?");
        interaction.client.setRole = sql.prepare("INSERT OR REPLACE INTO roles (guildID, roleID, level) VALUES (@guildID, @roleID, @level);");

        if(method === 'add') {
            if(isNaN(levelArgs) && !levelArgs || levelArgs < 1) {
                return interaction.reply(`Please provide a level to set.`);
            } else {
                if(!role) {
                    return interaction.reply(`You did not provide a role to set!`);
                } else {
                let Role = interaction.client.getRole.get(interaction.guild.id, role.id, levelArgs) 
                if(!Role) {
                    Role = {
                        guildID: interaction.guild.id,
                        roleID: role.id,
                        level: levelArgs
                    }
                    interaction.client.setRole.run(Role)
                    let embed = new Discord.MessageEmbed()
                        .setTitle(`Successfully set role!`)
                        .setDescription(`${role} has been set for level ${levelArgs}`)  
                        .setColor("#5AC0DE");
                     return interaction.editReply({embeds: [embed]});
                 } else if(Role){
                    interaction.client.deleteLevel = sql.prepare(`DELETE FROM roles WHERE guildID = ? AND roleID = ? AND level = ?`)
                    interaction.client.deleteLevel.run(interaction.guild.id, role.id, levelArgs)
                    interaction.client.updateLevel = sql.prepare(`INSERT INTO roles(guildID, roleID, level) VALUES(?,?,?)`)
                    interaction.client.updateLevel.run(interaction.guild.id, role.id, levelArgs);

                    let embed = new Discord.MessageEmbed()
                        .setTitle(`Successfully set role!`)
                        .setDescription(`${role} has been updated for level ${levelArgs}`)
                        .setColor("#5AC0DE");

                    return interaction.editReply({embeds: [embed]})
                 }
                }
            }
        }

        if(method === 'show') {
            const allRoles = sql.prepare(`SELECT * FROM roles WHERE guildID = ?`).all(interaction.guild.id)
            if(!allRoles) {
                return interaction.reply(`There is no roles set!`)
            } else {
                let embed = new Discord.MessageEmbed()
                    .setTitle(`${interaction.guild.name} Roles Level`)
                    .setDescription(`\`${prefix}help role-level\` for more information`)
                    .setColor("#5AC0DE");

                for(const data of allRoles) {
                    let LevelSet = data.level;
                    let RolesSet = data.roleID;
                 embed.addFields({ name: `\u200b`, value: `**Level ${LevelSet}**: <@&${RolesSet}>` }); 
                }

                return interaction.editReply({embeds: [embed]});
            }
        }

        interaction.client.getLevel = sql.prepare(`SELECT * FROM roles WHERE guildID = ? AND level = ?`)
        const levels = interaction.client.getLevel.get(interaction.guild.id, levelArgs)

        if(method === 'remove' || method === 'delete') {
            if(isNaN(levelArgs) && !levelArgs || levelArgs < 1) {
                return interaction.editReply(`Please provide a level to remove.`);
            } else {
                if(!levels) {
                    return interaction.editReply(`That isn't a valid level!`);
                } else {
                    interaction.client.deleteLevel = sql.prepare(`DELETE FROM roles WHERE guildID = ? AND level = ?`)
                    interaction.client.deleteLevel.run(interaction.guild.id, levelArgs);

                    let embed = new Discord.MessageEmbed()
                        .setTitle(`Successfully set role!`)
                        .setDescription(`Role rewards for level ${levelArgs} has been removed.`)
                        .setColor("#5AC0DE");

                    return interaction.editReply({embeds: [embed]})
                }
            }
        }

    }
}
