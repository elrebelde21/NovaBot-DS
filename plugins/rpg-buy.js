import {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} from "discord.js";

const XP_PER_DIAMOND = 350;

const handler = async (message) => {
  const user = global.db.data.users[message.author.id];
  if (!user) return message.reply("✳️ El usuario no se encuentra en mi base de datos.");

  user.pickaxe ||= "wood";
  
  const embed = new EmbedBuilder()
    .setColor("#8E44AD")
    .setTitle("🛒 Tienda RPG • NovaBot-DS")
    .setDescription(`💎 **Comprar Diamantes**
• 1 💎 = **${XP_PER_DIAMOND} XP**
• Compra desde el menú

⛏️ **Picos disponibles**
${Object.values(rpg)
  .filter(p => p.price > 0)
  .map(p => `• ${p.name} — ${p.price} XP`)
  .join("\n")}

🧰 **Pico equipado:** ${rpg[user.pickaxe]?.name || rpg.wood.name}

📊 **Tus datos**
• XP: ${user.exp}
• 💎 Diamantes: ${user.limit}
    `)
    .setFooter({ text: "NovaBot-DS • Sistema Económico RPG" });

  const select = new StringSelectMenuBuilder()
    .setCustomId("shop_select")
    .setPlaceholder("🛒 ¿Qué deseas comprar?")
    .addOptions([
      {
        label: "💎 Comprar 1 Diamante",
        value: "buy_1",
        description: `${XP_PER_DIAMOND} XP`
      },
      {
        label: "💎 Comprar TODOS los Diamantes",
        value: "buy_all",
        description: "Usa todo tu XP disponible"
      },
      ...Object.entries(rpg)
        .filter(([_, v]) => v.price > 0)
        .map(([k, v]) => ({
          label: v.name,
          value: `pickaxe_${k}`,
          description: `${v.price} XP`
        }))
    ]);

  const row = new ActionRowBuilder().addComponents(select);

  const msg = await message.reply({
    embeds: [embed],
    components: [row]
  });

  const collector = msg.createMessageComponentCollector({
    filter: i => i.user.id === message.author.id,
    time: 60_000
  });

  collector.on("collect", async i => {
    await i.deferUpdate();

    if (i.values[0] === "buy_1") {
      if (user.exp < XP_PER_DIAMOND)
        return i.followUp({
          content: "❌ No tienes suficiente XP.",
          ephemeral: true
        });

      user.exp -= XP_PER_DIAMOND;
      user.limit += 1;

      return i.followUp({
        content: "✅ Has comprado **1 💎**",
        ephemeral: true
      });
    }

    if (i.values[0] === "buy_all") {
      const count = Math.floor(user.exp / XP_PER_DIAMOND);
      if (count <= 0)
        return i.followUp({
          content: "❌ No tienes XP suficiente.",
          ephemeral: true
        });

      user.exp -= count * XP_PER_DIAMOND;
      user.limit += count;

      return i.followUp({
        content: `✅ Has comprado **${count} 💎**`,
        ephemeral: true
      });
    }

    if (i.values[0].startsWith("pickaxe_")) {
      const type = i.values[0].replace("pickaxe_", "");
      const pickaxe = rpg[type];

      if (!pickaxe)
        return i.followUp({
          content: "❌ Pico inválido.",
          ephemeral: true
        });

      if (user.pickaxe === type)
        return i.followUp({
          content: "⛏️ Ya tienes ese pico equipado.",
          ephemeral: true
        });

      if (user.exp < pickaxe.price)
        return i.followUp({
          content: "❌ No tienes suficiente XP.",
          ephemeral: true
        });

      user.exp -= pickaxe.price;
      user.pickaxe = type;

      return i.followUp({
        content: `⛏️ Has comprado **${pickaxe.name}**`,
        ephemeral: true
      });
    }
  });
};

handler.help = ["shop"];
handler.tags = ["econ"];
handler.command = /^shop$/i;
handler.register = true;

handler.slash = {
  name: "shop",
  description: "Abrir la tienda RPG"
};

export default handler;
