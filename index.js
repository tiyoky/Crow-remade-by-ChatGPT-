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
    } else if (command === 'mute') {
        // Votre code pour la commande mute
    } else if (command === 'kick') {
        // Votre code pour la commande kick
    } else if (command === 'help') {
        const embed = new Discord.MessageEmbed()
            .setTitle('Liste des commandes')
            .addField(`${prefix}create <emoji>`, 'Crée un emoji dans le serveur.')
            .addField(`${prefix}ban <@utilisateur>`, 'Bannit l\'utilisateur mentionné.')
            .addField(`${prefix}mute <@utilisateur> <durée>`, 'Mute l\'utilisateur pour une durée spécifiée.')
            .addField(`${prefix}kick <@utilisateur>`, 'Kick l\'utilisateur mentionné.')
            .setColor('#0099ff');
        
        message.channel.send(embed);
    }
});

client.login(token);
