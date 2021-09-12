//dependency
const Discord = require("discord.js");
const fs = require("fs");
const axios = require("axios");
const IntraApi = require('epitech_intranet_api')
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
        let embed = new Discord.MessageEmbed();
        embed.setColor(color.Blue);
        embed.setTitle(`Helping`);
        embed.addField(`**Login**`,`Log user to Intrabot`, true);
        embed.addField(`**Logout**`,`Logout user to Intrabot`, true);
        embed.addField(`**Profil/Profile**`, `Send your detailled profil`, true);
        embed.addField(`**gpa**`,`Send your GPA`, true);
        embed.addField(`**Xp**`, `Send your Xp with some detail`, true);
        embed.addField(`**Crédit**`,`Send your Crédits`, true);
        embed.addField(`**Flags**`,`Send your Flags`, true);
        embed.addField(`**Binomes**`,`Send your Binomes`, true);
        embed.addField(`**News**`,`Send your last Notification`, true);
        embed.addField(`**deadline**`,`Send the Currently Date and the end of projet`, true);
        embed.addField(`**Projet**`,`Send you the list projet and timeline`, true);
        embed.addField(`**Activity**`,`Send you the list activity and timeline`, true);
        embed.addField(`**Docs**`,`Send you all Technical Document`, true);
        return message.channel.send(embed);
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
    else if (command === "profil" || command === "profile") {
        const index = getUserIndex(data, message.author.id);
        if (index > -1) {
            axios.get(`https://intra.epitech.eu/auth-${data.log[index].auth}/user/?format=json`).then(async response => {
                const intra = new IntraApi(`https://intra.epitech.eu/auth-${data.log[index].auth}`);
                let all = response.data.location.split("/");
                let city = all.pop();
                let url = `https://intra.epitech.eu/`;
                let year = response.data.scolaryear;
                let name = response.data.title;
                let gpa = response.data.gpa[0].gpa;
                let login = response.data.login;
                let credits = response.data.credits;
                let promo = response.data.promo;
                let location = response.data.location;
                const attachment = new Discord.MessageAttachment(`https://intra.epitech.eu/auth-${data.log[index].auth}/file/userprofil/profilview/${data.log[index].mail}.jpg`, "profile-pic.jpg")
                let xp = await intra.user.getXp(year)
                let embed2 = new Discord.MessageEmbed();
                embed2.setColor(color.Yellow);
                embed2.setTitle(`Wait`);
                embed2.attachFiles(attachment);
                embed2.setThumbnail('attachment://profile-pic.jpg');
                embed2.setDescription(`Calculating...`);
                let msg = await message.channel.send(embed2)
                let embed = new Discord.MessageEmbed();
                embed.setColor(color.Green);
                embed.setTitle(`${name}`);
                embed.attachFiles(attachment);
                embed.setThumbnail('attachment://profile-pic.jpg');
                embed.setURL(`${url}`);
                embed.setDescription(`**Login**: ${login}\n**City**: ${location}\n**Promotion**: ${promo}\n**GPA**: ${gpa}\n**Crédits**: ${credits}\n**XP**: ${xp} You can do !xp for details`);
                return msg.edit(embed);
            });
        } else {
            let embed = new Discord.MessageEmbed();
            embed.setColor(color.Red);
            embed.setTitle(`Error`);
            embed.setDescription(`Your not log so you cannot do this command do !login`);
            return message.channel.send(embed);
        }
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
        const index = getUserIndex(data, message.author.id);
        if (index > -1) {
            let embed2 = new Discord.MessageEmbed();
            embed2.setColor(color.Yellow);
            embed2.setTitle(`Wait`);
            embed2.setDescription(`Calculating...`);
            let msg = await message.channel.send(embed2)
            const intra = new IntraApi(`https://intra.epitech.eu/auth-${data.log[index].auth}`);
            let year = await intra.user.getScolarYear();
            let xp = await intra.user.getXp(year);
            let embed = new Discord.MessageEmbed();
            embed.setColor(color.Green);
            embed.setTitle(`XP`);
            embed.setDescription(`Your XP was ${xp}`);
            return msg.edit(embed);
        } else {
            let embed = new Discord.MessageEmbed();
            embed.setColor(color.Red);
            embed.setTitle(`Error`);
            embed.setDescription(`Your not log so you cannot do this command do !login`);
            return message.channel.send(embed);
        }  
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
        const index = getUserIndex(data, message.author.id);
        if (index > -1) {
            axios.get(`https://intra.epitech.eu/auth-${data.log[index].auth}/user/${data.log[index].mail}/flags?format=json`).then(response => {
                const flags = response.data.flags;
                let embed = new Discord.MessageEmbed();
                embed.setColor(color.Green);
                embed.setTitle(`Flags`);
                embed.addField(flags.ghost.label + emote.absent, flags.ghost.nb, true);
                embed.addField(flags.difficulty.label + emote.dificulty, flags.difficulty.nb, true);
                embed.addField(flags.remarkable.label + emote.pouce, flags.remarkable.nb, true);
                embed.addField(flags.medal.label + emote.medal, flags.medal.nb, true);
                return message.channel.send(embed);
            }).catch((e) => {
                const flags = e.response.data.flags;
                let embed = new Discord.MessageEmbed();
                embed.setColor(color.Green);
                embed.setTitle(`Flags`);
                embed.addField(flags.ghost.label + " " + emote.absent, flags.ghost.nb, true);
                embed.addField(flags.difficulty.label + " " + emote.dificulty, flags.difficulty.nb, true);
                embed.addField(flags.remarkable.label + " " + emote.pouce, flags.remarkable.nb, true);
                embed.addField(flags.medal.label + " " + emote.medal, flags.medal.nb, true);
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

    //binomes
    else if (command === "binomes" || command == "binome") {
        const index = getUserIndex(data, message.author.id);
        if (index > -1) {
            axios.get(`https://intra.epitech.eu/auth-${data.log[index].auth}/user/${data.log[index].mail}/binome?format=json`).then(response => {
                let embed = new Discord.MessageEmbed();
                DATA = response.data.binomes;
                const login = response.data.user.login.split('@epitech.eu');
                let nbstudent = DATA.length;
                embed.setTitle(`Binomes of ${login[0]}`)
                embed.setColor(color.Green);
                for (let j = 0; j < nbstudent; j++) {
                    const student = DATA[j]
                    const logstudent = student.login.split('@epitech.eu');
                    embed.addField(`${logstudent[0]}`, `${student.weight}`, true);
                }
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

    //grade
    else if (command === "grade" || command === "grades") {
        const index = getUserIndex(data, message.author.id);
        if (index > -1) {
            axios.get(`https://intra.epitech.eu/auth-${data.log[index].auth}/user/${data.log[index].mail}/notes?format=json`).then(response => {
                DATA = response.data.modules;
                let embed = new Discord.MessageEmbed();
                let nbmodules = DATA.length;
                for (let k = 0; k < nbmodules; k++) {
                    const modules = DATA[k].codemodule
                    if (args[0] == modules) {
                        embed.setTitle(`Grade on Module ${DATA[k].title}`)
                        embed.setColor(color.Green);
                        if (DATA[k].grade == '-') {
                            embed.setDescription(`Grade Not Set`);
                        } else {
                            embed.setDescription(`Your Grade was ${DATA[k].grade}`)
                        }
                        return message.channel.send(embed);
                    }
                }
                let embed2 = new Discord.MessageEmbed();
                embed2.setColor(color.Red);
                embed2.setTitle(`Error`);
                embed2.setDescription(`**Put a Valid Module**\n Exemple !grade B-MUL-100`);
                return message.channel.send(embed2);
            });
        } else {
            let embed = new Discord.MessageEmbed();
            embed.setColor(color.Red);
            embed.setTitle(`Error`);
            embed.setDescription(`Your not log so you cannot do this command do !login`);
            return message.channel.send(embed);
        }
    }

    //news
    else if (command === 'news' || command === 'notif' || command === 'notification') {
        const index = getUserIndex(data, message.author.id);
        if (args[0] === "alert" || args[0] === "coming" || args[0] === "missed" || args[0] === "message") {
            if (index > -1) {
                axios.get(`https://intra.epitech.eu/auth-${data.log[index].auth}/user/${data.log[index].mail}/notification/${args[0]}?format=json`).then(response => {
                    DATA = response.data;
                    let embed = new Discord.MessageEmbed();
                    embed.setColor(color.Green);
                    embed.setTitle(`News on ${args[0]}`);
                    if (args[0] === "alert") {
                        let nbalert = DATA.length;
                        if (nbalert == undefined)
                            nbalert = 0;
                        embed.setDescription(`**You got ${nbalert} alert**`);
                        if (nbalert >= 1)
                            embed.setColor(color.Yellow);
                        if (nbalert >= 3)
                            embed.setColor(color.Red);
                        for (let k = 0; k < nbalert; k++) {
                        embed.addField(`alert ${k + 1} :`,`${DATA[k].title}`, true);
                        }
                    }
                    if (args[0] === "coming") {
                        let nbcomming = DATA.length;
                        if (nbcomming == undefined)
                            nbcomming = 0;
                        embed.setDescription(`**You got ${nbcomming} comming**`);
                        for (let k = 0; k < nbcomming; k++) {
                        embed.addField(`coming ${k + 1} :`,`${DATA[k].title}`, true);
                        }
                    }
                    if (args[0] === "missed") {
                        let nbmissed = DATA.recents.length;
                        if (nbmissed == undefined)
                            nbmissed = 0;
                        embed.setDescription(`**You got ${nbmissed} missed**`);
                        if (nbmissed >= 1)
                            embed.setColor(color.Yellow);
                        if (nbmissed >= 3)
                            embed.setColor(color.Red);
                        for (let k = 0; k < nbmissed; k++) {
                        embed.addField(`coming ${k + 1} :`,`${DATA[k].title}`, true);
                        }
                    }
                    if (args[0] === "message") {
                        let nbmessage = DATA.length;
                        if (nbmessage == undefined)
                            nbmessage = 0;
                        embed.setDescription(`**You got ${nbmessage} message**`);
                        for (let k = 0; k < nbmessage; k++) {
                        embed.addField(`message ${k + 1} :`,`**Category:** ${DATA[k].class}\n**Content:** ${DATA[k].content}`, true);
                        }
                    }
                    message.channel.send(embed);
                });
            } else {
                let embed = new Discord.MessageEmbed();
                embed.setColor(color.Red);
                embed.setTitle(`Error`);
                embed.setDescription(`Your not log so you cannot do this command do !login`);
                return message.channel.send(embed);
            }
        } else {
            let embed = new Discord.MessageEmbed();
            embed.setColor(color.Red);
            embed.setTitle(`Error`);
            embed.setDescription(`**The only arg you can put was**\n !news [alert, coming, missed, message]`);
            return message.channel.send(embed);
        }
    }

    //deadline
    else if (command === 'deadline') {
        const index = getUserIndex(data, message.author.id);
        if (args[0]) {
            if (index > -1) {
                const response = await axios.get(`https://intra.epitech.eu/auth-${data.log[index].auth}/?format=json`);
                let project = response.data.board.projets;
                let dataproject = project.length;
                for (let i = 0; i < dataproject; i++) {
                    if (project[i].title.toLowerCase() == args[0].toLowerCase()) {
                        let d = new Date();
                        let Currently = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}, ${d.getHours()}:${d.getMinutes()}`;
                        let start = project[i].timeline_start;
                        let end = project[i].timeline_end;
                        let embed = new Discord.MessageEmbed();
                        embed.setColor(color.Green);
                        embed.setTitle(`The deadline of ${project[i].title}`);
                        embed.setDescription(`**Start**: ${start}\n**Currently**: ${Currently}\n**End**: ${end}`);
                        return message.channel.send(embed);
                    }
                }
                let embed = new Discord.MessageEmbed();
                embed.setColor(color.Red);
                embed.setTitle(`Error`);
                embed.setDescription(`Put a valid Project`);
                return message.channel.send(embed);
            } else {
                let embed = new Discord.MessageEmbed();
                embed.setColor(color.Red);
                embed.setTitle(`Error`);
                embed.setDescription(`Your not log so you cannot do this command do !login`);
                return message.channel.send(embed);
            }
        } else {
            let embed = new Discord.MessageEmbed();
            embed.setColor(color.Red);
            embed.setTitle(`Error`);
            embed.setDescription(`**You need to put a project**\n Exemple !deadline [project]`);
            return message.channel.send(embed);
        }
    }

    //projet
    else if (command === 'projet') {
        const index = getUserIndex(data, message.author.id);
        if (index > -1) {
            const response = await axios.get(`https://intra.epitech.eu/auth-${data.log[index].auth}/?format=json`);
            let project = response.data.board.projets;
            let dataproject = project.length;
            let embed = new Discord.MessageEmbed();
            embed.setColor(color.Green);
            embed.setTitle(`**Project**`);
            for (let k = 0; k < dataproject; k++) {
                let actual = project[k].title.split("-");
                if (actual[0] != "Back To The Future ")
                    embed.addField(`${project[k].title}`,`${project[k].timeline_barre}%`,true);
            }
            return message.channel.send(embed);
        } else {
            let embed = new Discord.MessageEmbed();
            embed.setColor(color.Red);
            embed.setTitle(`Error`);
            embed.setDescription(`Your not log so you cannot do this command do !login`);
            return message.channel.send(embed);
        }
    }

    //activite
    else if (command === 'activite') {
        const index = getUserIndex(data, message.author.id);
        if (index > -1) {
            const response = await axios.get(`https://intra.epitech.eu/auth-${data.log[index].auth}/?format=json`);
            let project = response.data.board.activites;
            let dataproject = project.length;
            let embed = new Discord.MessageEmbed();
            embed.setColor(color.Green);
            embed.setTitle(`**Project**`);
            for (let k = 0; k < dataproject; k++) {
                embed.addField(`${project[k].title}`,`${project[k].timeline_barre}%`,true);
            }
            return message.channel.send(embed);
        } else {
            let embed = new Discord.MessageEmbed();
            embed.setColor(color.Red);
            embed.setTitle(`Error`);
            embed.setDescription(`Your not log so you cannot do this command do !login`);
            return message.channel.send(embed);
        }
    }

    //docs
    else if (command === 'docs' || command == 'man' || command === 'doc') {
        if (args[0]) {
            const index = getUserIndex(data, message.author.id);
                if (index > -1) {
                    const response = await axios.get(`https://intra.epitech.eu/auth-${data.log[index].auth}/file/Public/technical-documentations/?format=json`);
                    let DATA = response.data;
                    let datalenght = DATA.length;
                    let embed2 = new Discord.MessageEmbed();
                    embed2.setColor(color.Blue);
                    embed2.setTitle(`**Click here**`);
                    message.author.createDM().then(channel => {
                        for (let i = 0; i < datalenght; i++) {
                            if (`${DATA[i].title}` == args[0]) {
                                embed2.setDescription(`https://intra.epitech.eu${DATA[i].fullpath}`);
                            }
                        }
                        if (embed2.description == null || embed2.description == undefined)
                            embed2.setDescription(`Unvalid path`);
                            embed2.setColor(color.Red);
                        channel.send(embed2)
                    });
                    let embed = new Discord.MessageEmbed();
                    embed.setColor(color.Green  );
                    embed.setTitle(`Done`);
                    embed.setDescription(`**Files Send in DM**`);
                    return message.channel.send(embed);
                }else {
                    let embed = new Discord.MessageEmbed();
                    embed.setColor(color.Red);
                    embed.setTitle(`Error`);
                    embed.setDescription(`Your not log so you cannot do this command do !login`);
                    return message.channel.send(embed);
                }
        } else {
            const index = getUserIndex(data, message.author.id);
                if (index > -1) {
                    let embed = new Discord.MessageEmbed();
                    embed.setColor(color.Blue);
                    embed.setTitle(`Put a files name`);
                    const response = await axios.get(`https://intra.epitech.eu/auth-${data.log[index].auth}/file/Public/technical-documentations/?format=json`);
                    let DATA = response.data;
                    let datalenght = DATA.length;
                    for (let i = 0; i < datalenght; i++) {
                        embed.addField(`${DATA[i].title}`,`${i}`, true);
                    }
                    return message.channel.send(embed);
                }else {
                    let embed = new Discord.MessageEmbed();
                    embed.setColor(color.Red);
                    embed.setTitle(`Error`);
                    embed.setDescription(`Your not log so you cannot do this command do !login`);
                    return message.channel.send(embed);
                }
            }
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