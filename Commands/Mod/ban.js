const discord = module.require("discord.js");

module.exports = {
  name: "ban",
  category: "moderation",
  description: "Ban anyone with one shot whithout knowing anyone xD",
  usage: "ban <@user> <reason>",
  userPerms: ["BAN_MEMBERS"],
  botPerms: ["EMBED_LINKS", "BAN_MEMBERS"],
  run: async (client, message, args) => {
    let reason = args.slice(1).join(" ");
    if (!reason) reason = "Unspecified";

    const target = message.mentions.members.first() || message.guild.users.cache.get(args[0]);

    if (!target) {
      return message.channel.send(
        `**${message.author.username}**, Please mention the person who you want to ban.`
      );
    }

    if (target.id === message.author.id) {
      return message.channel.send(
        `**${message.author.username}**, You can not ban yourself!`
      );
    }
    if (target.id === message.guild.ownerId) {
      return message.channel.send("You cannot Ban The Server Owner");
    }

    let embed = new discord.MessageEmbed()
      .setTitle("Action : Ban")
      .setDescription(`Banned ${target} (${target.id})\nReason: ${reason}`)
      .setColor("#ff2050")
      .setThumbnail(target.avatarURL)
      .setFooter(`Banned by ${message.author.tag}`);

let userbanembed = new discord.MessageEmbed()
        .setTitle(`You have been banned from ${message.guild.name}`)
        .setDescription(`You have been banned because: ${reason}. If you would like to appeal please DM a moderator or the owner of the server.`)
        .setFooter(`Banned by ${message.author.tag}`)
        .setColor("RANDOM")

    await message.guild.bans.create(target, {
      reason: reason
    }).then(() => {
        message.channel.send({ embeds: [embed] }) & target.send({ embeds: [userbanembed] });
      });
  },
};
