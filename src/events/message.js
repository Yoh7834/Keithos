const { MessageEmbed, Collection } = require('discord.js');
const { oneLine } = require('common-tags');
const serverblacklist = require('../../serverbanlist.json')


module.exports = (client, message) => {
  if (message.channel.type === 'dm' || !message.channel.viewable || message.author.bot) return;

  // Get disabled commands
  let disabledCommands = client.db.settings.selectDisabledCommands.pluck().get(message.guild.id) || [];
  if (typeof (disabledCommands) === 'string') disabledCommands = disabledCommands.split(' ');

  // Get points
  const { point_tracking: pointTracking, message_points: messagePoints, command_points: commandPoints } =
    client.db.settings.selectPoints.get(message.guild.id);

  // Command handler
  const prefix = client.db.settings.selectPrefix.pluck().get(message.guild.id);
  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\s*`);

  if (prefixRegex.test(message.content)) {

    // Get mod channels
    let modChannelIds = message.client.db.settings.selectModChannelIds.pluck().get(message.guild.id) || [];
    if (typeof (modChannelIds) === 'string') modChannelIds = modChannelIds.split(' ');

    const [, match] = message.content.match(prefixRegex);
    const args = message.content.slice(match.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    let command = client.commands.get(cmd) || client.aliases.get(cmd); // If command not found, check aliases
    if (command && !disabledCommands.includes(command.name)&& !serverblacklist.bans.includes(message.guild.id)) {

      if(serverblacklist.bans.includes(message.guild.id) ){
    
        client.logger.info(`Someone tried to use commands in ${message.guild.name}(${message.guild.id}), but the server is banned in serverbanlist.json`);
        message.channel.send('Your server is blacklisted. If you think this is an error please contact us to fix it.\n Our support server: https://discord.gg/M7nDZxKk24 \n Main developer: MCorange#4829')
        return
      }

      // Check if mod channel
      if (modChannelIds.includes(message.channel.id)) {
        if (
          command.type != client.types.MOD || (command.type == client.types.MOD &&
            message.channel.permissionsFor(message.author).missing(command.userPermissions) != 0)
        ) {
          // Update points with messagePoints value
          if (pointTracking)
            client.db.users.updatePoints.run({ points: messagePoints }, message.author.id, message.guild.id);
          return; // Return early so Keithos doesn't respond
        }
      }

      if (command.toggleCooldown) {

        if (!client.cooldowns.has(command.name)) {
          client.cooldowns.set(command.name, new Collection());
        };

        const time = client.cooldowns.get(command.name);
        const amount = (command.cooldown || 5) * 1000;

        if (time.has(message.author.id)) {

          const expire = time.get(message.author.id) + amount;

          if (Date.now() < expire) {
            const left = (expire - Date.now()) / 1000;

            return message.channel.send(`The command is currently on \`${left.toFixed(1)}\` seconds`);
          };
        };

        time.set(message.author.id, Date.now());
        setTimeout(() => time.delete(message.author.id), amount);

      };

      // Check permissions
      const permission = command.checkPermissions(message);
      if (permission) {

        // Update points with commandPoints value
        if (pointTracking)
          client.db.users.updatePoints.run({ points: commandPoints }, message.author.id, message.guild.id);
        message.command = true; // Add flag for messageUpdate event
        return command.run(message, args); // Run command
      }
    } else if(!serverblacklist.bans.includes(message.guild.id)){if (
      (message.content === `<@${client.user.id}>` || message.content === `<@!${client.user.id}>`) &&
      message.channel.permissionsFor(message.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS']) &&
      !modChannelIds.includes(message.channel.id)
    ) {
      const embed = new MessageEmbed()
      .setTitle('Hi, I\'m 𝓒𝓱𝓪𝔃𝓾𝓴𝓲\'s bot. Need help?')
        .setThumbnail('https://github.com/Yoh7834/Keithos/raw/main/data/images/icon.jpg')
        .setDescription(`You can see everything I can do by using the \`${prefix}help\` command.`)
        
        .addField('Support', oneLine`If you have questions, suggestions, or found a bug, please  DM MCorange#4829 to speak directly with the developer!`)
        .setColor(message.guild.me.displayHexColor);
      message.channel.send(embed);
    }} else {
        client.logger.info(`Someone tried to use commands in ${message.guild.name}(${message.guild.id}), but the server is banned in serverbanlist.json`);
        message.channel.send('Your server is blacklisted. If you think this is an error please contact us to fix it.\n Our support server: https://discord.gg/M7nDZxKk24 \n Main developer: MCorange#4829')
        return
    }
  }

  // Update points with messagePoints value
  if (pointTracking) client.db.users.updatePoints.run({ points: messagePoints }, message.author.id, message.guild.id);
};

