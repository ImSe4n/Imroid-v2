const Discord = require("discord.js");
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');
const client = new Discord.Client({
    intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_PRESENCES],
});
module.exports = {
    name: 'set-level',
    aliases: ['levelset'],
    category: "Leveling",
    description: "Set user Level and XP",
    cooldown: 3,
    "options": [
        {
            "name": "level",
            "description": "The level to set",
            // Type of input from user: https://discord.com/developers/docs/interactions/slash-commands#applicationcommandoptiontype
            "type": 4,
            "required": true,
        },
        {
            "name": "user",
            "description": "The user of whom to set level (defaults to you)",
            "type": 6,
            "required": false
        }
    ],    
    run: async(client, interaction, args)=>  {
        if(!interaction.member.permissions.has("MANAGE_GUILD")) return interaction.reply(`You do not have permission to use this command!`);

        await interaction.deferReply();

        let user = interaction.options.getUser("user", false) || interaction.user;

        const levelArgs = interaction.options.getInteger("level");

        client.getScore = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
        client.setScore = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (@id, @user, @guild, @xp, @level, @totalXP);");
        if(!user) {
            return interaction.reply(`Please mention an user!`)
        } else {
            if(isNaN(levelArgs) || levelArgs < 1) {
                return interaction.editReply(`Please provide a valid number!`)
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
                score.level = levelArgs
                const newTotalXP = levelArgs - 1
                let embed = new Discord.MessageEmbed()
                    .setTitle(`Success!`)
                    .setDescription(`Successfully set ${levelArgs} level for ${user.toString()}!`)
                    .setColor("#5AC0DE");
                
                score.totalXP = newTotalXP * 2 * 250 + 250
                score.xp = 0
                client.setScore.run(score);
                return interaction.editReply({embeds: [embed]});
            }
        }
    }
}