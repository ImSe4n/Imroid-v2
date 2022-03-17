const { Schema, model } = require('mongoose');

const ticket = Schema({
    guildID: String,
    userID: String,
    ticketID: String,
    ticketGuildID: String,
    ticketChannelID: String,
    ticketCount: Number,
    ticketStatus: Boolean,
    msgID: String,
    msgPannelID: String
});

module.exports = model('ticket', ticket);