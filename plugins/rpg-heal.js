import { EmbedBuilder } from "discord.js";

const MAX_HEALTH = 100;
const COOLDOWN = 30 * 60 * 1000;

const handler = async (message) => {
  const user = global.db.data.users[message.author.id];
  if (!user) return message.reply("✳️ User not registered.");

  user.lastHeal = user.lastHeal || 0;

  const time = user.lastHeal + COOLDOWN;
  if (Date.now() < time)
    return message.reply(`⏳ Wait *${msToTime(time - Date.now())}* to heal again.`);

  if (user.health >= MAX_HEALTH)
    return message.reply("❤️ Your health is already full.");

  user.health += 40;
  if (user.health > MAX_HEALTH) user.health = MAX_HEALTH;

  user.lastHeal = Date.now();

  const embed = new EmbedBuilder()
    .setColor("#3498DB")
    .setTitle("🛏️ Heal")
    .setDescription(`
✨ You have healed successfully.

❤️ Health: **${user.health}/${MAX_HEALTH}**
    `)
    .setTimestamp();

  message.reply({ embeds: [embed] });
};

handler.help = ["heal"];
handler.tags = ["econ"];
handler.command = /^heal$/i;
handler.register = true;

handler.slash = {
  name: "heal",
  description: "Recover health (cooldown)"
};

export default handler;

function msToTime(ms) {
  let m = Math.floor(ms / 60000);
  let s = Math.floor((ms / 1000) % 60);
  return `${m}m ${s}s`;
}
