const Discord = require("discord.js");
const SQLite = require("better-sqlite3");
const sql = new SQLite('./mainDB.sqlite')
const canvacord = require("canvacord");

module.exports = {
    name: 'rank',
    aliases: ['rank'],
    description: "Get your rank or another member's rank",
    cooldown: 3,
    options: [{
        name: 'target',
        description: 'The user\'s rank card to show',
        type: 6,
        required: false
    }, ],
    category: "Leveling",
    run: async(client, interaction, args)=> {

        await interaction.deferReply();

        let user = interaction.options.getUser("target") || interaction.user;

        client.getScore = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
        client.setScore = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (@id, @user, @guild, @xp, @level, @totalXP);");

        const top10 = sql.prepare("SELECT * FROM levels WHERE guild = ? ORDER BY totalXP").all(interaction.guild.id);
        let score = client.getScore.get(user.id, interaction.guild.id);

        if (!score) {
            if (user == interaction.user) {
                return interaction.editReply("You do not have any XP yet! Chat and be active to get more XP.")
            } else {
                return interaction.editReply(`${user.username} does not have any XP yet!`)
            }
        }

        const levelInfo = score.level;
        const nextXP = levelInfo * 2 * 250 + 250;
        const xpInfo = score.xp;
        const totalXP = score.totalXP;

        let rank = top10.sort((a, b) => {
            return b.totalXP - a.totalXP
        });

        let ranking = rank.map(x => x.totalXP).indexOf(totalXP) + 1

        try {
            var cardBg = sql.prepare("SELECT bg FROM background WHERE user = ? AND guild = ?").get(user.id, interaction.guild.id).bg;
            var bgType = "IMAGE";
        } catch (e) {
            var cardBg = "#000000";
            var bgType = "COLOR";
        }

        console.log(interaction.member.presence);
        const rankCard = new canvacord.Rank()
            .setAvatar(user.displayAvatarURL({
                format: "jpg"
            }))
            .setStatus(interaction.guild.members.cache.find(member => member.id == user.id).presence.status ?? interaction.member.presence.status, true, 1)
            .setCurrentXP(xpInfo)
            .setRequiredXP(nextXP)
            .setProgressBar("#5AC0DE", "COLOR")
            .setUsername(user.username)
            .setDiscriminator(user.discriminator)
            .setRank(ranking)
            .setLevel(levelInfo)
            .setLevelColor("#5AC0DE")
            .renderEmojis(true)
            .setBackground(bgType, cardBg);

        rankCard.build()
            .then(data => {
                const attachment = new Discord.MessageAttachment(data, "RankCard.png");
                return interaction.editReply({
                    files: [attachment]
                });
            });

    }

}
