import {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} from "discord.js";

const ITEMS = {
  gema_brillante: {
    name: "💠 Gema Brillante",
    desc: "Otorga +500 XP",
    use: (user) => {
      user.exp += 500;
      return "✨ Has ganado **500 XP**";
    }
  },
  reliquia_antigua: {
    name: "🏺 Reliquia Antigua",
    desc: "Otorga +300 de dinero",
    use: (user) => {
      user.money += 300;
      return "💰 Has ganado **$300**";
    }
  },
  nucleo_energetico: {
    name: "⚡ Núcleo Energético",
    desc: "Restaura +20 de salud",
    use: (user) => {
      user.health += 20;
      if (user.health > 100) user.health = 100;
      return "❤️ Has recuperado **20 de salud**";
    }
  },
  fragmento_divino: {
    name: "🌠 Fragmento Divino",
    desc: "Otorga +1000 XP",
    use: (user) => {
      user.exp += 1000;
      return "🌠 Has ganado **1000 XP**";
    }
  }
};

const handler = async (message) => {
  const user = global.db.data.users[message.author.id];
  if (!user) return message.reply("✳️ Usuario no registrado.");
  user.inventory ||= [];
  if (user.inventory.length === 0) return message.reply("🎒 Tu inventario está vacío.");
  
  const countItems = {};
  for (const it of user.inventory) {
    countItems[it] = (countItems[it] || 0) + 1;
  }

  const select = new StringSelectMenuBuilder()
    .setCustomId("inv_use")
    .setPlaceholder("🎒 Selecciona un ítem para usar")
    .addOptions(
      Object.entries(countItems).map(([id, qty]) => ({
        label: ITEMS[id]?.name || id,
        value: id,
        description: `${ITEMS[id]?.desc || "Ítem desconocido"} | x${qty}`
      }))
    );

  const embed = new EmbedBuilder()
    .setColor("#9B59B6")
    .setTitle("🎒 Inventario • NovaBot-DS")
    .setDescription(`
📦 **Objetos disponibles**
Selecciona un ítem para usarlo.

📊 **Tus stats**
• XP: ${user.exp}
• Dinero: $${user.money}
• Salud: ❤ ${user.health}
    `)
    .setFooter({ text: "NovaBot-DS • Sistema RPG" });

  const msg = await message.reply({
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(select)]
  });

  const collector = msg.createMessageComponentCollector({
    filter: i => i.user.id === message.author.id,
    time: 60_000,
    max: 1
  });

  collector.on("collect", async i => {
    const itemId = i.values[0];
    const item = ITEMS[itemId];

    if (!item) {
      return i.reply({
        content: "❌ Este ítem no se puede usar.",
        ephemeral: true
      });
    }

    // Consumir ítem
    const index = user.inventory.indexOf(itemId);
    if (index !== -1) user.inventory.splice(index, 1);

    const resultText = item.use(user);

    const result = new EmbedBuilder()
      .setColor("#2ECC71")
      .setTitle("🎒 Ítem usado")
      .setDescription(`
${item.name}

${resultText}

📊 **Stats actuales**
• XP: ${user.exp}
• Dinero: $${user.money}
• Salud: ❤ ${user.health}
      `)
      .setTimestamp();

    await i.update({
      embeds: [result],
      components: []
    });
  });
};

handler.help = ["inventory", "inv"];
handler.tags = ["econ"];
handler.command = /^(inventory|inv)$/i;
handler.register = true;

handler.slash = {
  name: "inventory",
  description: "Ver y usar objetos del inventario"
};

export default handler;
