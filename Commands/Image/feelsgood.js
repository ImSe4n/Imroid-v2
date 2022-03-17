const Discord = require("discord.js");

module.exports = {
    name: "feelsgood",
    permissions: ["SEND_MESSAGES"],
    cooldown: 3,
    description: "Image Manipulation Command",
    run: async (client, message, args) => {
        const splitArgs = args.join(" ").split("/")
        const text1 = splitArgs[0]
        if (!text1) return message.channel.send("Provide proper arguments! Note: Use '/' to split the text")
        const text2 = splitArgs[1]
        if (!text2) return message.channel.send("Provide proper arguments! Note: Use '/' to split the text")
        message.channel.send({ files: [{ attachment: `https://api.memegen.link/images/feelsgood/${text1}/${text2}`, name: "meme.png" }] });
    }
}
