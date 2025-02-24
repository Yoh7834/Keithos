const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const pkg = require(__basedir + '/package.json');
const { owner } = require('../../utils/emojis.json');
const { oneLine, stripIndent } = require('common-tags');

module.exports = class BotInfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'botinfo',
      aliases: ['bot', 'bi'],
      usage: 'botinfo',
      description: 'Fetches 𝓒𝓱𝓪𝔃𝓾𝓴𝓲\'s bot bot information.',
      type: client.types.INFO
    });
  }
  run(message) {
    const botOwner = message.client.users.cache.get(message.client.ownerId[0]);
    const prefix = message.client.db.settings.selectPrefix.pluck().get(message.guild.id);
    const tech = stripIndent`
      Version     :: ${pkg.version}
      Library     :: Discord.js v12.3.1
      Environment :: Node.js v12.16.3
      Database    :: SQLite
    `;
    const embed = new MessageEmbed()
      .setTitle('𝓒𝓱𝓪𝔃𝓾𝓴𝓲\'s Bot Information')
      .setDescription(oneLine`
        𝓒𝓱𝓪𝔃𝓾𝓴𝓲\'s bot is an open source, fully customizable Discord bot that is constantly growing.
        She comes packaged with a variety of commands and 
        a multitude of settings that can be tailored to your server's specific needs. 
        his codebase also serves as a base framework to easily create Discord bots of all kinds..
      `)
      .addField('Prefix', `\`${prefix}\``, true)
      .addField('Client ID', `\`${message.client.user.id}\``, true)
      .addField(`Developer ${owner}`, botOwner, true)
      .addField('Tech', `\`\`\`asciidoc\n${tech}\`\`\``)
      .setImage('https://raw.githubusercontent.com/MCorange99/keithos/blob/main/data/images/Calypso.png')
      .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(message.guild.me.displayHexColor);
    message.channel.send(embed);
  }
};
