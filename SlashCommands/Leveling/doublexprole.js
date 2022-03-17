const SQLite = require("better-sqlite3");
const sql = new SQLite('./mainDB.sqlite');

module.exports = {
    name: 'double-xp-role',
    aliases: [],
    category: "Leveling",
    description: "Set specific channel to send level up message",
    "options": [{
        "name": "role",
        "description": "The role that doubles XP",
        // Type of input from user: https://discord.com/developers/docs/interactions/slash-commands#applicationcommandoptiontype
        "type": 8,
        "required": true,
    }],
    cooldown: 3,
    run: async(client, interaction, args)=> {
        if(!interaction.member.permissions.has("MANAGE_GUILD")) return interaction.reply(`You do not have permission to use this command!`);

        let role = interaction.options.getRole("role");

        sql.prepare("INSERT OR REPLACE INTO doubleXP (guild, role) VALUES (?, ?);").run(interaction.guild.id, role.id);
        return interaction.reply(`Double XP role has been set to ${role.name}`);
    }
}