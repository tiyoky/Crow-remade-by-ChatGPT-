const Discord = require('discord.js');
const client = new Discord.Client();
const { prefix, token } = require('./config.json');

let welcomeChannelId = null;

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

    } else if (command === 'setbienvenue') {
        // Vérifie que l'utilisateur a la permission de gérer le serveur
        if (!message.member.hasPermission('MANAGE_GUILD')) {
            return message.channel.send("Vous n'avez pas la permission de gérer le serveur.");
        }

        // Vérifie si le salon a été mentionné
        const channel = message.mentions.channels.first();
        if (!channel) {
            return message.channel.send("Merci de mentionner un salon valide.");
        }

        // Met à jour l'ID du salon de bienvenue
        welcomeChannelId = channel.id;
        message.channel.send(`Le salon de bienvenue a été défini sur ${channel}.`);

    } else if (command === 'disbienvenue') {
        // Vérifie que l'utilisateur a la permission de gérer le serveur
        if (!message.member.hasPermission('MANAGE_GUILD')) {
            return message.channel.send("Vous n'avez pas la permission de gérer le serveur.");
        }

        // Désactive la fonction de bienvenue
        welcomeChannelId = null;
        message.channel.send("La fonction de bienvenue a été désactivée.");
        
    } else if (command === 'help') {
        const embed1 = new Discord.MessageEmbed()
            .setTitle('modération')
            .setDescription(`Commandes de modération`)
            .addField(`${prefix}ban <@utilisateur>`, 'Bannit l\'utilisateur mentionné.')
            .addField(`${prefix}mute <@utilisateur> <durée>`, 'Mute l\'utilisateur pour une durée spécifiée.')
            .addField(`${prefix}kick <@utilisateur>`, 'Kick l\'utilisateur mentionné.')
            .setColor('#0099ff');
        
        const embed2 = new Discord.MessageEmbed()
            .setTitle('gestion')
            .setDescription(`Autres commandes`)
            .addField(`${prefix}create <emoji>`, 'créer L emojie choisi dans le message')
            .addField(`${prefix}setbienvenue <le salon>`, 'active le message de bienvenue quand quelqun rejoin le serveur')
            .addField(`${prefix}disbienvenue `, 'desactive le message de bienvenue quand quelqun rejoin le serveur')
            .setColor('#0099ff');
        
        message.channel.send(embed1).then(embedMessage => {
            embedMessage.react('➡️'); // Ajouter une réaction pour naviguer vers la deuxième page

            const filter = (reaction, user) => {
                return ['➡️'].includes(reaction.emoji.name) && user.id === message.author.id;
            };
            
            const collector = embedMessage.createReactionCollector(filter, { time: 60000 }); // Collecteur de réactions pendant 60 secondes

            collector.on('collect', (reaction, user) => {
                switch (reaction.emoji.name) {
                    case '➡️':
                        embedMessage.edit(embed2);
                        break;
                    // Ajoutez d'autres cas pour d'autres réactions si nécessaire
                }
            });
        });
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

client.on('guildMemberAdd', member => {
    if (welcomeChannelId) {
        const channel = member.guild.channels.cache.get(welcomeChannelId);
        if (channel) {
            const memberCount = member.guild.memberCount;
            const welcomeMessage = `Bienvenue à ${member}, nous sommes maintenant ${memberCount} dans le serveur !`;
            channel.send(welcomeMessage);
        }
    }
});

client.login(token);
