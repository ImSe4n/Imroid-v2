const prefixModel = require("../../database/guildData/prefix");
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const { DEFAULT_PREFIX, OWNER_ID } = require('../../config')
const { Collection, MessageEmbed } = require("discord.js")
module.exports = async (message, cooldowns) => {

  let client = message.client;

  const prefixData = await prefixModel.findOne({
    GuildID: message.guild.id,
  }).catch(err=>console.log(err))

  if (prefixData) {
    var PREFIX = prefixData.Prefix
  } else if (!prefixData) {
    PREFIX = DEFAULT_PREFIX
  }
  client.prefix = PREFIX;

  if (message.author.bot) return;


  if (!message.guild.me.permissionsIn(message.channel).has("SEND_MESSAGES"))
    return;

  const prefixRegex = new RegExp(
    `^(<@!?${client.user.id}>|${escapeRegex(PREFIX)})\\s*`
  );
  if (!prefixRegex.test(message.content)) return;

  const [, matchedPrefix] = message.content.match(prefixRegex);

  const p = matchedPrefix.length;
  const args = message.content.slice(p).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (!command) return;
    //command enaled thing
    if(command.enabled === false) {
      return message.reply('This command is disabled!')
    }
    // ownerOnly thing
    if(command.ownerOnly === true) {
      if(!message.author.id === OWNER_ID) {
        return message.reply('This command is Owner only!')
      }
    }
    // user permissions handler
  if (!message.member.permissions.has(command.userPerms || [])) {
    if(command.userPermError === null || command.userPermError === undefined) {
      return message.reply(`You need  \`${command.userPerms}\` permissions to use this comand!`);
    } else {
      return message.reply(command.userPermError)
    }
  }



  // bot permissions handler
  if (!message.guild.me.permissions.has(command.botPerms || [])) {
  if(command.botPermError === null || command.botPermError === undefined) {
    return message.reply(
      `Ups :/  I need \`${command.botPerms}\` premission|s to run this command correctly`
    );
 } else {
    return message.reply(command.botPermError)
  }
  }
      //guildOnly thing
  if(command.guildOnly === true) {
    console.log(message.channel.type)
    if(message.channel.type === 'DM' || message.channel.type === 'GROUP_DM') {
      return message.reply('This command is Server only!')
    }
  }
    //nsfw thingy
    if(command.nsfw === true) {
      if(message.channel.nsfw === false) {
        return message.reply('This command is NSFW only, mark the channel as nsfw for this command to work!')
      }
    }
  //min args and max args thing
  const arguments = message.content.split(/[ ]+/)

        arguments.shift()
        if (
          arguments.length < command.minArgs ||
          (command.maxArgs !== null && arguments.length > command.maxArgs)
        ) {
          return message.reply(command.expectedArgs)
          
        }




  

  // cooldowns
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 1) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `please wait ${timeLeft.toFixed(
          1
        )} more second(s) before reusing the \`${command.name}\` command.`
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.run(client, message, args, p, cooldowns);
  } catch (error) {
    console.error(error);
    let embed2000 = new MessageEmbed()
      .setDescription("There was an error executing that command.")
      .setColor("BLUE");
    message.channel.send({ embeds: [embed2000] }).catch(console.error);
  }
};
/* 
example usage
module.exports = {
  name: "name",
  description: "description",
  aliases: [],
  botPerms: [],
  userPerms: [],
  expectedArgs: null,
  minArgs: 1,
  maxArgs: 2,
  ownerOnly: true,
  guildOnly: true,
  enabled: true,
  nsfw: false,
  userPermError: null,
  botPermError: null,
  run: async (client, message, args) => {
    //code
  },
};

*/
