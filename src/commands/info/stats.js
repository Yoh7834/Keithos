const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const { mem, cpu, os } = require('node-os-utils');
const { stripIndent } = require('common-tags');

module.exports = class StatsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'stats',
      aliases: ['statistics', 'metrics'],
      usage: 'stats',
      description: 'Fetches Keihos statistics.',
      type: client.types.INFO
    });
  }
  async run(message) {
    const d = moment.duration(message.client.uptime);
    const days = (d.days() == 1) ? `${d.days()} day` : `${d.days()} days`;
    const hours = (d.hours() == 1) ? `${d.hours()} hour` : `${d.hours()} hours`;
    const clientStats = stripIndent`
      Servers   :: ${message.client.guilds.cache.size}
      Users     :: ${message.client.users.cache.size}
      Channels  :: ${message.client.channels.cache.size}
      WS Ping   :: ${Math.round(message.client.ws.ping)}ms
      Uptime    :: ${days} and ${hours}
    `;
    const { totalMemMb, usedMemMb } = await mem.info();
    const serverStats = stripIndent`
      OS        :: ${await os.oos()}
      CPU       :: ${cpu.model()}
      Cores     :: ${cpu.count()}
      CPU Usage :: ${await cpu.usage()} %
      RAM       :: ${totalMemMb} MB
      RAM Usage :: ${usedMemMb} MB 
    `;
    const embed = new MessageEmbed()
      .setTitle('𝓒𝓱𝓪𝔃𝓾𝓴𝓲\'s bot Statistics')
      .addField('Commands', `\`${message.client.commands.size}\` commands`, true)
      .addField('Aliases', `\`${message.client.aliases.size}\` aliases`, true)
      .addField('Command Types', `\`${Object.keys(message.client.types).length}\` command types`, true)
      .addField('Client', `\`\`\`asciidoc\n${clientStats}\`\`\``)
      .addField('Server', `\`\`\`asciidoc\n${serverStats}\`\`\``)
      .addField(
        'Links', 
        '**[Invite Me](https://discord.com/api/oauth2/authorize?client_id=837371090783174696&permissions=0&redirect_uri=https%3A%2F%2Fdiscord.events.stdlib.com%2Fdiscord%2Fauth%2F&scope=bot) | ' +
        '[Support Server](https://discord.gg/M7nDZxKk24) | ' +
        '[Repository](https://github.com/KeithosTeam/Keithos)**'
      )
      .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(message.guild.me.displayHexColor);
    message.channel.send(embed);
  }
};
