const SQLite = require("better-sqlite3");
const sql = new SQLite('./mainDB.sqlite')

module.exports = {
    name: 'background',
    aliases: ['bg'],
    description: "Set a card background",
    cooldown: 3,
	options: [
		{
			name: 'bgurl',
			description: 'The image URL for the background you wish to add (leave empty to reset)',
			type: 3,
            required: false
		},
	],
    category: "Leveling",
    run: async(client, interaction, args)=> {
                await interaction.deferReply();
            
		if(!interaction.options.getString("bgurl")) {
			sql.prepare("DELETE FROM background WHERE user = (?);").run(interaction.user.id);
			return await interaction.editReply("Your rank card background has been reset!");
		}
        var valid = /^(http|https):\/\/[^ "]+$/.test(interaction.options.getString("bgurl")) && (interaction.options.getString("bgurl").endsWith(".png") || interaction.options.getString("bgurl").endsWith(".jpg") || interaction.options.getString("bgurl").endsWith("jpeg"));
		if(!valid) return interaction.reply("Please enter a valid image URL. It must use HTTP or HTTPS and be a PNG, JPG, or JPEG image. It must not have a `?` or `&` at the end.");
		
		try {
			sql.prepare("INSERT OR REPLACE INTO background (user, guild, bg) VALUES (?, ?, ?);").run(interaction.member.id, interaction.guild.id, interaction.options.getString("bgurl"));
			await interaction.editReply("Background set!");
		} catch (e) {
			await interaction.editReply("An error occurred while setting the background.");
			console.error(e);
		}
    }
}
