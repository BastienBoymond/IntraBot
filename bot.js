//dependency
const Discord = require("discord.js");
const fs = require("fs");
const axios = require("axios");
const bot = new Discord.Client();

//Json parsing
const config = JSON.parse(fs.readFileSync("config.json").toString());
const color = JSON.parse(fs.readFileSync("color.json").toString());
const emote = JSON.parse(fs.readFileSync("emote.json").toString());
let data;
try {
    data = JSON.parse(fs.readFileSync(config.data, 'utf8'));
} catch(e) {
    data = {
        log: []
    }
    fs.writeFileSync(config.data, JSON.stringify(data));
}

function getUserIndex(Data, user)
{
    for (i = 0; Data.log[i]; i++) {
        if (Data.log[i].user === user)
            return (i);
    }
    return (-1);
}

//Starting of bot
bot.on("ready", () => {
    console.log("Intrabot ready to do action");
    bot.user.setActivity('Connected to Intranet');
});

//Bot command
bot.on("message", async message => {
    //Start of prefix
    const prefix = config.prefix;
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    console.log(`${message.author.tag} do the command ${command}`);

    //Help
    if (command === "help") {

    }

    //Login
    else if (command === "login" && message.channel.type === "dm") {
        if (args[0]) {
            if (args[0].length == 73 || args[0].length == 70 || args[0].length == 40) {
                const autolog = args[0].substr(args[0].length - 40);
                axios.get(`https://intra.epitech.eu/auth-${autolog}/user/?format=json`).then(response => {
                    if (response.data.login) {
                        const index = getUserIndex(data, message.author.id);
                        if (index > -1)
                            data.log.splice(index, 1);
                        data.log.push({"user": message.author.id, "mail": response.data.login, "auth": autolog});
                        fs.writeFileSync(config.data, JSON.stringify(data));
                        console.log(message.author.tag + " is now known as " + response.data.login);
                        let embed = new Discord.MessageEmbed();
                        embed.setColor(color.Green);
                        embed.setTitle(`Connected`);
                        embed.setDescription(`You can use the bot now !`);
                        return message.channel.send(embed);
                    }
                });
            }
        } else {
            let embed = new Discord.MessageEmbed();
            embed.setColor(color.Red);
            embed.setTitle(`Error`);
            embed.setDescription("**We need your autologin to connect you**\nGo on this page to take it : { https://intra.epitech.eu/admin/autolog }\n");
            return message.channel.send(embed);
        }
    } else if (command === "login") {
        let embed = new Discord.MessageEmbed();
        embed.setColor(color.Red);
        embed.setTitle(`Error`);
        embed.setDescription(`To use this command go in Dm`);
        return message.channel.send(embed);
    }

    //Logout
    else if (command === "logout" && message.channel.type === "dm") {
        const index = getUserIndex(data, message.author.id);
        if (index > -1) {
            data.log.splice(index, 1);
            fs.writeFileSync(config.data, JSON.stringify(data));
            console.log(message.author.tag + " has been disconnected.");
            let embed = new Discord.MessageEmbed();
            embed.setColor(color.Green);
            embed.setTitle(`Disconnected`);
            embed.setDescription(`You are Desconnected for the bot`);
            return message.channel.send(embed);
        } else {
            let embed = new Discord.MessageEmbed();
            embed.setColor(color.Red);
            embed.setTitle(`Error`);
            embed.setDescription(`Your not log so I cannot Logout you`);
            return message.channel.send(embed);
        }

    } else if (command === "logout") {
        let embed = new Discord.MessageEmbed();
        embed.setColor(color.Red);
        embed.setTitle(`Error`);
        embed.setDescription(`To use this command go in Dm`);
        return message.channel.send(embed);
    }

    //Profil
    else if (command === "profil") {

    }

    //Gpa
    else if (command === "gpa") {
        const index = getUserIndex(data, message.author.id);
        if (index > -1) {
            axios.get(`https://intra.epitech.eu/auth-${data.log[index].auth}/user/?format=json`).then(response => {
                const gpa = response.data.gpa[0].gpa;
                let embed = new Discord.MessageEmbed();
                embed.setColor(color.Green);
                embed.setTitle(`GPA`);
                embed.setDescription(`Your GPA was ${gpa}`);
                return message.channel.send(embed);
            });
        } else {
            let embed = new Discord.MessageEmbed();
            embed.setColor(color.Red);
            embed.setTitle(`Error`);
            embed.setDescription(`Your not log so you cannot do this command do !login`);
            return message.channel.send(embed);
        }
    }

    //xp
    else if (command === "xp") {

    }

    //Credit
    else if (command === "credits" || command === "credit") {
        const index = getUserIndex(data, message.author.id);
        if (index > -1) {
            axios.get(`https://intra.epitech.eu/auth-${data.log[index].auth}/user/?format=json`).then(response => {
                const credits = response.data.credits;
                let embed = new Discord.MessageEmbed();
                embed.setColor(color.Green);
                embed.setTitle(`Credits ${emote.credits}`);
                embed.setDescription(`You got ${credits} credits`);
                return message.channel.send(embed);
            });
        } else {
            let embed = new Discord.MessageEmbed();
            embed.setColor(color.Red);
            embed.setTitle(`Error`);
            embed.setDescription(`Your not log so you cannot do this command do !login`);
            return message.channel.send(embed);
        }
    }

    //flags
    else if (command === "flags") {

    }

    //binomes
    else if (command === "binomes") {

    }

    //grade
    else if (command === "grade") {

    }

    //news
    else if (command === 'news') {

    }

    //deadline
    else if (command === 'deadline') {

    }

    //projet
    else if (command === 'projet') {

    }

    //activite
    else if (command === 'activite') {

    }

    //docs
    else if (command === 'docs') {

    }

    //emploi
    else if (command === 'emploi') {

    }

    //learn
    else if (command === 'learn') {

    }
    //if wrong command 
    else {
        let embed = new Discord.MessageEmbed();
        embed.setColor(color.Blue);
        embed.setTitle(`Command does not exist`);
        embed.setDescription(`Use the command !help to access at all Command`);
        message.channel.send(embed)
    }
});

bot.on("guildMemberAdd", member => {
    roles = member.guild.roles.cache.find(roles => roles.name === 'User');
    member.roles.add(roles);
    member.createDM().then(channel => {
        let embed = new Discord.MessageEmbed();
        embed.setColor(color.Blue);
        embed.setTitle(`Welcome`);
        embed.setDescription(`To use the bot do !login [Autologin]`);
        return channel.send(embed);
    });
});

bot.login(config.token);