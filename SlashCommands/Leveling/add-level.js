const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');
const Discord = require("discord.js")

module.exports = {
    name: 'add-level',
    aliases: ['give-level'],
    category: "Leveling",
    description: "Give or Add level to specified user",
    cooldown: 3,
    "options": [
        {
            "name": "level",
            "description": "The level(s) to add",
            // Type of input from user: https://discord.com/developers/docs/interactions/slash-commands#applicationcommandoptiontype
            "type": 4,
            "required": true,
        },
        {
            "name": "user",
            "description": "The user of whom to add level(s) (defaults to you)",
            "type": 6,
            "required": false
        }
    ],   
    run: async(client, interaction, args)=> {
        let user = interaction.options.getUser("user") || interaction.user;

        if(!interaction.member.permissions.has("MANAGE_GUILD")) return interaction.reply(`You do not have permission to use this command!`);

        const levelArgs = interaction.options.getInteger("level");

        client.getScore = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
        client.setScore = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (@id, @user, @guild, @xp, @level, @totalXP);");
        if(!user) {
            return interaction.reply(`Please mention an user!`)
        } else {
            if(isNaN(levelArgs) || levelArgs < 1) {
                return interaction.reply(`Please provide a valid number!`)
            } else {
                let score = client.getScore.get(user.id, interaction.guild.id);
                if(!score) {
                    score = {
                        id: `${interaction.guild.id}-${user.id}`,
                        user: user.id,
                        guild: interaction.guild.id,
                        xp: 0,
                        level: 0,
                        totalXP: 0
                    }
                }
                score.level += levelArgs
                const newTotalXP = levelArgs - 1
                let embed = new Discord.MessageEmbed()
                    .setTitle(`Success!`)
                    .setDescription(`Successfully added ${levelArgs} level to ${user.toString()}!`)
                    .setColor("RANDOM");

                score.totalXP += newTotalXP * 2 * 250 + 250
                client.setScore.run(score)
                return interaction.channel.send({embeds: [embed]})
            }
        }
    }
}