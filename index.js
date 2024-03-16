const Discord = require('discord.js');
const client = new Discord.Client();
const { prefix, token } = require('./config.json');

client.once('ready', () => {
    console.log('Bot is ready!');
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'create') {
        // Vérifie que l'utilisateur a envoyé un emoji
        if (!args.length || !args[0].match(/<:[a-zA-Z0-9]+:[0-9]+>/)) {
            return message.channel.send("Merci de spécifier un emoji valide.");
        }

        const emojiName = args[0].split(':')[1];
        const emojiId = args[0].split(':')[2].slice(0, -1);
        
        // Crée l'emoji dans le serveur
        message.guild.emojis.create(`https://cdn.discordapp.com/emojis/${emojiId}.png`, emojiName)
            .then(emoji => message.channel.send(`Emoji ${emoji} créé avec succès!`))
            .catch(error => {
                console.error('Erreur lors de la création de l\'emoji:', error);
                message.channel.send("Une erreur s'est produite lors de la création de l'emoji.");
            });
    } else if (command === 'ban') {
        // Vérifie que l'utilisateur a la permission de bannir des membres
        if (!message.member.hasPermission('BAN_MEMBERS')) {
            return message.channel.send("Vous n'avez pas la permission de bannir des membres.");
        }

        const user = message.mentions.users.first();
        if (user) {
            const member = message.guild.member(user);
            if (member) {
                member.ban({ reason: 'Raison optionnelle' })
                    .then(() => {
                        message.reply(`${user.tag} a été banni avec succès.`);
                    })
                    .catch(error => {
                        console.error('Erreur lors du bannissement:', error);
                        message.channel.send("Une erreur s'est produite lors du bannissement de l'utilisateur.");
                    });
            } else {
                message.channel.send("Cet utilisateur n'est pas sur le serveur.");
            }
        } else {
            message.channel.send("Merci de mentionner l'utilisateur à bannir.");
        }
} else if (command === 'kick') {
    // Vérifie que l'utilisateur a la permission de kicker des membres
    if (!message.member.hasPermission('KICK_MEMBERS')) {
        return message.channel.send("Vous n'avez pas la permission de kicker des membres.");
    }

    // Vérifie si l'utilisateur mentionne un membre à kicker
    const user = message.mentions.users.first();
    if (user) {
        const member = message.guild.member(user);
        if (member) {
            // Kicke le membre
            member.kick('Raison optionnelle').then(() => {
                message.reply(`${user.tag} a été kické avec succès.`);
            }).catch(err => {
                console.error('Erreur lors du kick:', err);
                message.channel.send("Une erreur s'est produite lors du kick de l'utilisateur.");
            });
        } else {
            message.channel.send("Cet utilisateur n'est pas sur le serveur.");
        }
    } else {
        message.channel.send("Merci de mentionner l'utilisateur à kick.");
    }
}

    } else if (command === 'kick') {
        // Votre code pour la commande     } else if (command === 'help') {
        const embed = new Discord.MessageEmbed()
            .setTitle('Liste des commandes')
            .addField(`${prefix}create <emoji>`, 'Crée un emoji dans le serveur.')
            .addField(`${prefix}ban <@utilisateur>`, 'Bannit l\'utilisateur mentionné.')
            .addField(`${prefix}mute <@utilisateur> <durée>`, 'Mute l\'utilisateur pour une durée spécifiée.')
            .addField(`${prefix}kick <@utilisateur>`, 'Kick l\'utilisateur mentionné.')
            .setColor('#0099ff');
        
        message.channel.send(embed);
    } else if (command === 'unban') {
        // Vérifie que l'utilisateur a la permission de débannir des membres
        if (!message.member.hasPermission('BAN_MEMBERS')) {
            return message.channel.send("Vous n'avez pas la permission de débannir des membres.");
        }

        // Vérifie que l'argument est un ID d'utilisateur valide
        const userId = args[0];
        if (!userId) {
            return message.channel.send("Merci de spécifier l'ID de l'utilisateur à débannir.");
        }

        // Débannit l'utilisateur
        message.guild.fetchBans()
            .then(bans => {
                if (bans.size === 0) {
                    return message.channel.send("Aucun utilisateur n'est banni sur ce serveur.");
                }

                const bannedUser = bans.find(ban => ban.user.id === userId);
                if (!bannedUser) {
                    return message.channel.send("Cet utilisateur n'est pas banni sur ce serveur.");
                }

                message.guild.members.unban(bannedUser.user)
                    .then(() => {
                        message.channel.send(`L'utilisateur avec l'ID ${userId} a été débanni avec succès.`);
                    })
                    .catch(error => {
                        console.error('Erreur lors du débannissement:', error);
                        message.channel.send("Une erreur s'est produite lors du débannissement de l'utilisateur.");
                    });
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des bannissements:', error);
                message.channel.send("Une erreur s'est produite lors de la récupération des bannissements.");
            });
    }
});

client.login(token);
