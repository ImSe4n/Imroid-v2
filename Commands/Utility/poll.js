const Discord = module.require("discord.js");

module.exports = {
  name: "poll",
  description: "Start a Poll",
  userPerms: ["MANAGE_SERVER"],
  run: async (client, message, args) => {
    const pll = args.join(" ");
    if (!message.member.permissions.has("MANAGE_SERVER")) {
      return message.channel.send("You don't have enough Permissions");
    }
    if (!pll) {
      return message.channel.send("Enter some text for the Poll");
    }
    let embed = new Discord.MessageEmbed()
      .setTitle("Poll Time")
      .setDescription(`${pll}`)
      .setFooter(`Started by ${message.author.username}`)
      .setColor("RANDOM");
    message.channel
      .send({ embeds: [embed] })
      .then(function (message, str) {
        message.react("👍");
        message.react("👎");
      })
      .catch(function () {});
  },
};
