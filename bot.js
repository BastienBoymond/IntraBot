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
    else if (command === "profil" || command === "profile") {
        const index = getUserIndex(data, message.author.id);
        if (index > -1) {
            let embed2 = new Discord.MessageEmbed();
            embed2.setColor(color.Yellow);
            embed2.setTitle(`Wait`);
            embed2.setDescription(`Calculating...`);
            let msg = await message.channel.send(embed2)
            axios.get(`https://intra.epitech.eu/auth-${data.log[index].auth}/user/?format=json`).then(async response => {
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
                let image = response.data.picture;
                let xp = 0;
                const responce = await axios.get(`https://intra.epitech.eu/auth-${data.log[index].auth}/module/${year}/B-INN-000/${city}-0-1/?format=json`)
                let activity = responce.data.activites;
                let projethub = 0;
                let limitWorkshop = 0;
                let limitTalk = 0;
                let limitExp = 0;
                let limitHack = 0;
                let dataactivity = activity.length;
                for (let i = 0; i < dataactivity ; i++) {
                    if (activity[i].type_title == "Workshop") {
                        evnt = activity[i].events;
                        let dataevnt = evnt.length;
                        for (let j = 0; j < dataevnt && limitWorkshop != 10; j++) {
                            if (evnt[j].user_status == "present") {
                                limitWorkshop += 1;
                                xp += 2;
                            } else if (evnt[j].user_status == "absent") {
                                limitWorkshop -= 1;
                                xp -= 2;
                            }
                        }
                    } else if (activity[i].type_title == "Talk") {
                        evnt = activity[i].events;
                        let dataevnt = evnt.length;
                        for (let j = 0; j < dataevnt && limitTalk != 15; j++) {
                            if (evnt[j].user_status == "present") {
                                limitTalk += 1;
                                xp += 1;
                            } else if (evnt[j].user_status == "absent") {
                                limitTalk -= 1;
                                xp -= 1;
                            }
                        }
                    } else if (activity[i].type_title == "Experience") {
                        if (limitExp < 8) {
                            acti = activity[i].codeacti;
                            const response = await axios.get(`https://intra.epitech.eu/auth-${data.log[index].auth}/module/${year}/B-INN-000/${city}-0-1/${acti}/project/?format=json`);
                            if (response.data.user_project_status == "project_confirmed") {
                                limitExp += 1;
                                xp += 3;
                            }
                        }
                    } else if (activity[i].type_title == "Hackathon") {
                        acti = activity[i].codeacti;
                        const response = await axios.get(`https://intra.epitech.eu/auth-${data.log[index].auth}/module/${year}/B-INN-000/${city}-0-1/${acti}/?format=json`);
                        evnt = response.data.events;
                        let dataevnt = evnt.length;
                        for (let j = 0; j < dataevnt; j++) {
                            if (evnt[j].user_status == "present") {
                                xp += 6;
                                limitHack += 1;
                            } else if (evnt[j].user_status == "absent") {
                                xp -= 6;
                                limitHack += 1;
                            }
                        }
                    } else if (activity[i].type_title == "Project") {
                        acti = activity[i].codeacti;
                        const response = await axios.get(`https://intra.epitech.eu/auth-${data.log[index].auth}/module/${year}/B-INN-000/${city}-0-1/${acti}/?format=json`);
                        if (response.data.user_project_status == "project_confirmed") {
                            projethub += parseInt(response.data.title.toLowerCase().replace("#hubproject - ").replace("xp"));
                            xp += projethub
                        }
                    }
                }
                let embed = new Discord.MessageEmbed();
                embed.setColor(color.Green);
                embed.setTitle(`${name}`);
                embed.setURL(`${url}`)
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
            axios.get(`https://intra.epitech.eu/auth-${data.log[index].auth}/user/?format=json`).then( response => {
                let all = response.data.location.split("/");
                let city = all.pop();
                let year = response.data.scolaryear;
                axios.get(`https://intra.epitech.eu/auth-${data.log[index].auth}/module/${year}/B-INN-000/${city}-0-1/?format=json`).then(async response => {
                    let activity = response.data.activites;
                    let xp = 0;
                    let projethub = 0;
                    let limitWorkshop = 0;
                    let limitTalk = 0;
                    let limitExp = 0;
                    let limitHack = 0;
                    let dataactivity = activity.length;
                    for (let i = 0; i < dataactivity ; i++) {
                        if (activity[i].type_title == "Workshop") {
                            evnt = activity[i].events;
                            let dataevnt = evnt.length;
                            for (let j = 0; j < dataevnt && limitWorkshop != 10; j++) {
                                if (evnt[j].user_status == "present") {
                                    limitWorkshop += 1;
                                    xp += 2;
                                } else if (evnt[j].user_status == "absent") {
                                    limitWorkshop -= 1;
                                    xp -= 2;
                                }
                            }
                        } else if (activity[i].type_title == "Talk") {
                            evnt = activity[i].events;
                            let dataevnt = evnt.length;
                            for (let j = 0; j < dataevnt && limitTalk != 15; j++) {
                                if (evnt[j].user_status == "present") {
                                    limitTalk += 1;
                                    xp += 1;
                                } else if (evnt[j].user_status == "absent") {
                                    limitTalk -= 1;
                                    xp -= 1;
                                }
                            }
                        } else if (activity[i].type_title == "Experience") {
                            if (limitExp < 8) {
                                acti = activity[i].codeacti;
                                const response = await axios.get(`https://intra.epitech.eu/auth-${data.log[index].auth}/module/${year}/B-INN-000/${city}-0-1/${acti}/project/?format=json`);
                                if (response.data.user_project_status == "project_confirmed") {
                                    limitExp += 1;
                                    xp += 3;
                                }
                            }
                        } else if (activity[i].type_title == "Hackathon") {
                            acti = activity[i].codeacti;
                            const response = await axios.get(`https://intra.epitech.eu/auth-${data.log[index].auth}/module/${year}/B-INN-000/${city}-0-1/${acti}/?format=json`);
                            evnt = response.data.events;
                            let dataevnt = evnt.length;
                            for (let j = 0; j < dataevnt; j++) {
                                if (evnt[j].user_status == "present") {
                                    xp += 6;
                                    limitHack += 1;
                                } else if (evnt[j].user_status == "absent") {
                                    xp -= 6;
                                    limitHack += 1;
                                }
                            }
                        } else if (activity[i].type_title == "Project") {
                            acti = activity[i].codeacti;
                            const response = await axios.get(`https://intra.epitech.eu/auth-${data.log[index].auth}/module/${year}/B-INN-000/${city}-0-1/${acti}/?format=json`);
                            if (response.data.user_project_status == "project_confirmed") {
                                projethub += parseInt(response.data.title.toLowerCase().replace("#hubproject - ").replace("xp"));
                                xp += projethub
                            }
                        }
                    }
                    let Talk;
                    let Workshop;
                    let Experience;
                    let Hack;
                    let Project;
                    if (limitTalk == 15) {
                        Talk = "You go 15 xp It's your limit";
                    }  else {
                        Talk = `You got ${limitTalk} xp. You can do ${15 -limitTalk} Talk to be at your limit`
                    }
                    if (limitWorkshop == 10) {
                        Workshop = "You go 20 xp It's your limit";
                    }  else {
                        Workshop = `You got ${limitWorkshop * 2} xp. You can do ${10 - limitWorkshop} Workshop to be at your limit`
                    }
                    if (limitExp == 10) {
                        Experience = "You go 20 xp It's your limit";
                    }  else {
                        Experience = `You got ${limitExp * 3} xp. You can do ${8 - limitExp} Experience to be at your limit`
                    }
                    Hack = `You got ${limitHack * 6} xp, You don't have limit on Hackatlon have fun`
                    Project = `You got ${projethub} xp, You don't have limit on Projet have fun`
                    let embed = new Discord.MessageEmbed();
                    embed.setColor(color.Green);
                    embed.setTitle(`Your Xp`);
                    embed.setDescription(`You got ${xp} xp\n**Détails**\n**Talk**: ${Talk}\n**Workshop**: ${Workshop}\n**Experience**: ${Experience}\n**Hackatlon**${Hack}\n**Projet Hub**: ${Project}`);
                    return msg.edit(embed);
                });
            });
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
                    if (project[i].title == args[0]) {
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