const Discord = require("discord.js");
const fs = require("fs");
const axios = require("axios");

const bot = new Discord.Client();
const config = JSON.parse(fs.readFileSync("config.json").toString());

bot.on("ready", () => {
    console.log("Intrabot ready to do action");
    bot.user.setActivity('Connected to Intranet');
});

bot.on("message", async message => {
    //Start of prefix
    const prefix = config.prefix;
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    console.log(`${message.author.tag} do the command ${command}`);

    //Help
    //Login
    //Logout
    //Profile
    //Gpa
    //xp
    //Credit
    //flags
    //binomes
    //grade
    //news
    //deadline
    //projet
    //activite
    //docs
    //emploi
    //learn
});

client.on("guildMemberAdd", member => {
    roles = member.guild.roles.cache.find(roles => roles.name === 'User');
    member.roles.add(roles);
    member.createDM().then(channel => {
        let embed = new Discord.MessageEmbed();
        embed.setColor('#FF0000');
        embed.setTitle(`Welcome`);
        embed.setDescription(`To use the bot do !login [Autologin]`);
        return channel.send(embed);
    });
});

bot.login(config.token);