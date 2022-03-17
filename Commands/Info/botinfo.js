const Discord = require("discord.js");
const moment = require("moment");
require("moment-duration-format");
module.exports = {
  name: "botinfo",
  description: "Shows the bot info",
  botPerms: ["EMBED_LINKS"],
  run: async (client, message, args) => {
    const duration = moment
      .duration(client.uptime)
      .format(" D [days], H [hrs], m [mins], s [secs]");

    let embed = new Discord.MessageEmbed()
      .setAuthor("Imroid's Info", client.user.avatarURL())
      .setColor("RANDOM")
      .setDescription(
        `**Bot Name: **Imroid \n**Owner: **[_Sean#1751] \n**Total Categories: **8 \n**Total Commands: **${client.commands.size} \n**Users:** ${
          client.users.cache.size
        } \n**Servers:** ${client.guilds.cache.size} \n**Channels:** ${
          client.channels.cache.size
        }`
      )
      .addField(
        "About Imroid",
        "Imroid is an open-source multi-purpose discord bot with features like moderation, music, logging, welcomer and so much more!"
      )
      .setFooter("Regards, Imroid Development Team");
    message.channel.send({ embeds: [embed] });
  },
};
