import { EmbedBuilder } from "discord.js";

const MAX_HEALTH = 100;

const handler = async (message) => {
  const user = global.db.data.users[message.author.id];
  if (!user) return message.reply("✳️ User not registered.");

  const cost = 200;
  const heal = 25;

  if (user.money < cost)
    return message.reply("❌ Not enough money.");

  if (user.health >= MAX_HEALTH)
    return message.reply("❤️ Health already full.");

  user.money -= cost;
  user.health += heal;
  if (user.health > MAX_HEALTH) user.health = MAX_HEALTH;

  const embed = new EmbedBuilder()
    .setColor("#2ECC71")
    .setTitle("🍖 Eat")
    .setDescription(`
😋 You ate some food.

❤️ Health: **${user.health}/${MAX_HEALTH}**
💸 Money left: **$${user.money}**
    `)
    .setTimestamp();

  message.reply({ embeds: [embed] });
};

handler.help = ["eat"];
handler.tags = ["econ"];
handler.command = /^eat$/i;
handler.register = true;

handler.slash = {
  name: "eat",
  description: "Recover health using money"
};

export default handler;
