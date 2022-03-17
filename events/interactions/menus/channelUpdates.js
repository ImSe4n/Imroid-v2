const { IntegrationApplication } = require("discord.js");
const channelData = require("../../../database/guildData/channelupdates")

module.exports = async(interaction, client) => {
    if (!interaction.isSelectMenu()) return;

    let msg = await interaction.channel.messages.fetch(interaction.message.id)

    if (interaction.values[0] === "channel_logs") {

        await interaction.deferUpdate()
        
        const data = await channelData.findOne({
            GuildID: interaction.guild.id
        })

        if (!data) {
            await msg.edit("Please send the **CHANNEL ID** to be setup for Channel Update Logs")

            const filter = (m) => m.author.id === interaction.member.id

            let channelID;

            const collector = await interaction.channel.createMessageCollector({ filter, time: 60000 })

            collector.on('collect', async(collected, returnValue) => {
                channelID = collected.content

                let channel = interaction.guild.channels.cache.get(channelID)

                if (!channel) return msg.edit("Couldn't find that channel!")

                let newData = new channelData({
                    ChannelID: channelID,
                    GuildID: interaction.guild.id
                })
    
                newData.save()

                await collector.stop()
    
                return msg.edit(`Channel updates will be logged in ${interaction.guild.channels.cache.get(channelID)}`)
            })

            collector.on('end', async(collected, returnValue) => {
                console.log("Collector Stopped!")
            })

        } else if (data) {
            await channelData.findOneAndRemove({
                GuildID: interaction.guild.id
            })

            return msg.edit(`Channel Updates Logging has been stopped!`)
        }
    }
}