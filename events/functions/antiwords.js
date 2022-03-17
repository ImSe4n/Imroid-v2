const antiwordsData = require('../../database/guildData/antiwords')
const ms = require("ms")
  module.exports = async (message) => {
    const antiwords = await antiwordsData.findOne({
      GuildID: message.guild.id,
    })
if (antiwords) {
    let blacklisted = ['bitch', 'hoe', 'slut', 'nigga', 'nigg', 'cunt', 'shit', 'fuck', 'bastard', 'piss', 'gay', 'retard', 'faggot', 'fag', 'batty', 'dyke', 'queer', 'pussy', 'porn', 'nigger', 'dick'];
    let foundInText = false;
    for (var i in blacklisted) {
      if (message.content.toLowerCase().includes(blacklisted[i].toLowerCase())) foundInText = true;
    }
    if (foundInText) {
        message.delete();
        message.reply("**No Bad Words Allowed Please Stop!**").then(msg => {
          let time = '4s'
          setTimeout(function () {
            msg.delete();
          }, ms(time));
        })
      } else {
        return;
      }
    } else if (!antiwords) {
        return;
    }

  }
