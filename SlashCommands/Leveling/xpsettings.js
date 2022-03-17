const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');

module.exports = {
    name: 'xpsettings',
    aliases: ['setxp', 'set-xp', 'xp-settings'],
    category: "Leveling",
    description: "Set custom XP and Cooldown",
    cooldown: 3,
    "options": [
        {
            // Name of the subcommand
            "name": "xp",
            // Short description of subcommand
            "description": "The amount of XP is earned per a later specified amount of seconds",
            // Type of input from user: https://discord.com/developers/docs/interactions/slash-commands#applicationcommandoptiontype
            "type": 10,
            // Whether the subcommand is required
            "required": true,
        },
        {
            "name": "seconds",
            "description": "How many seconds it takes to earn the aforementioned XP amount",
            "type": 10,
            "required": true
        }
    ],
    run: async(client, interaction, args)=>  {
        if(!interaction.member.permissions.has("MANAGE_GUILD")) return interaction.reply(`You do not have permission to use this command!`);
        
        if(interaction.options.getNumber("xp") < 1)
            return interaction.reply(`XP cannot be less than 0 XP!`);

        if(interaction.options.getNumber("seconds") < 1)
            return interaction.reply(`Cooldown cannot be less than 0 seconds!`);

        let checkIf = sql.prepare("SELECT levelUpMessage FROM settings WHERE guild = ?").get(interaction.guild.id);
        if(checkIf) {
            sql.prepare(`UPDATE settings SET customXP = ? WHERE guild = ?`).run(interaction.options.getNumber("xp"), interaction.guild.id);
            sql.prepare(`UPDATE settings SET customCooldown = ? WHERE guild = ?`).run(interaction.options.getNumber("seconds") * 1000, interaction.guild.id);
        } else {
            sql.prepare(`INSERT OR REPLACE INTO settings (guild, levelUpMessage, customXP, customCooldown) VALUES (?,?,?,?)`).run(interaction.guild.id, `**Congratulations** {member}! You have now leveled up to **level {level}**`, interaction.options.getNumber("xp"), interaction.options.getNumber("seconds") * 1000);
        }
        
        return interaction.reply(`Users from now will gain  ${interaction.options.getNumber("xp")}XP/${interaction.options.getNumber("seconds")}s`);
    }
}