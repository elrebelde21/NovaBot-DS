import {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} from "discord.js";

const handler = async (message) => {
  const userId = message.author.id;
  const user = global.db.data.users[userId];

  if (!user) return message.reply("✳️ Usuario no registrado.");

  const cooldown = 400000;
  const time = user.lastmiming + cooldown;

  if (Date.now() - user.lastmiming < cooldown) {
    return message.reply(
      `⏳ Espera *${msToTime(time - Date.now())}* para volver a minar`
    );
  }

  const minas = [
    {
      id: "penumbra",
      nombre: "⛏️ Penumbra",
      recom: [300, 700],
      req: { level: 0, money: 0, health: 0 },
      cost: { money: 0, health: 5 }
    },
    {
      id: "mistica",
      nombre: "🪨 Caverna Mística",
      recom: [700, 1500],
      req: { level: 3, money: 200, health: 10 },
      cost: { money: 50, health: 10 }
    },
    {
      id: "abismo",
      nombre: "⚡ Abismo",
      recom: [900, 2000],
      req: { level: 5, money: 500, health: 20 },
      cost: { money: 150, health: 18 }
    },
    {
      id: "zona",
      nombre: "❓ Zona Desconocida",
      recom: [1200, 2600],
      req: { level: 8, money: 1000, health: 30 },
      cost: { money: 300, health: 25 }
    },
    {
      id: "infernal",
      nombre: "🔥 Mina Infernal",
      recom: [4000, 7500],
      req: { level: 15, money: 5000, health: 60 },
      cost: { money: 800, health: 40 }
    },
    {
      id: "divina",
      nombre: "🌠 Mina Divina",
      recom: [12000, 18000],
      req: { level: 25, money: 20000, health: 90 },
      cost: { money: 2000, health: 60 }
    }
  ];

  const opciones = minas.map(m => {
    const cumple =
      user.level >= m.req.level &&
      user.money >= m.req.money &&
      user.health >= m.req.health;

    return {
      label: m.nombre,
      value: m.id,
      description: cumple
        ? `XP ${m.recom[0]}-${m.recom[1]} | 💸-${m.cost.money} ❤-${m.cost.health}`
        : `🔒 Req: Lv ${m.req.level}, $${m.req.money}, ❤ ${m.req.health}`
    };
  });

  const select = new StringSelectMenuBuilder()
    .setCustomId("minar_select")
    .setPlaceholder("⛏️ Elige una mina…")
    .addOptions(opciones);

  const row = new ActionRowBuilder().addComponents(select);

  const embed = new EmbedBuilder()
    .setColor("#6A00FF")
    .setTitle("⛏️ Sistema de Minería • NovaBot-DS")
    .setDescription(`
👤 **Minero:** <@${userId}>

📊 **Tus stats**
• Nivel: ${user.level}
• Dinero: $${user.money}
• Salud: ❤ ${user.health}

🌌 Selecciona una mina para comenzar la excavación.
⚠️ Cada zona tiene riesgos y recompensas distintas.`)
    .setFooter({ text: "NovaBot-DS • RPG Mining System" });

  const msg = await message.reply({
    embeds: [embed],
    components: [row]
  });

  const collector = msg.createMessageComponentCollector({
    filter: i => i.user.id === userId,
    time: 60_000,
    max: 1
  });

  collector.on("collect", async i => {
    const mina = minas.find(m => m.id === i.values[0]);
    if (!mina) return;

    // 🔒 Validar requisitos
    if (
      user.level < mina.req.level ||
      user.money < mina.req.money ||
      user.health < mina.req.health
    ) {
      return i.reply({
        content: `❌ No cumples los requisitos para **${mina.nombre}**`,
        ephemeral: true
      });
    }

    let base =
      Math.floor(Math.random() * (mina.recom[1] - mina.recom[0])) +
      mina.recom[0];

    const crit = Math.random() < 0.15;
    if (crit) base *= 2;

    // 💸 COSTOS REALES
    user.money -= mina.cost.money;
    user.health -= mina.cost.health;
    if (user.health < 0) user.health = 0;

    user.exp += base;
    user.lastmiming = Date.now();

    const frases = [
      "✨ Extracción legendaria:",
      "🔥 Excavación perfecta:",
      "💎 Minerales raros obtenidos:",
      "⚡ Golpe crítico:",
      "🌌 Resonancia minera:"
    ];

    const result = new EmbedBuilder()
      .setColor(crit ? "#FF3C00" : "#00E5FF")
      .setTitle("⛏️ ¡MINERÍA COMPLETADA!")
      .setDescription(`
${pickRandom(frases)} **${base} XP**
${crit ? "🔥 **CRÍTICO x2 ACTIVADO**" : ""}

🧭 **Zona:** ${mina.nombre}
💸 Dinero restante: $${user.money}
❤ Salud restante: ${user.health}
      `)
      .setFooter({ text: "Sistema de Minería NovaBot-DS" })
      .setTimestamp();

    await i.update({
      embeds: [result],
      components: []
    });
  });
};

handler.help = ["minar"];
handler.tags = ["econ"];
handler.slash = {
  name: "minar",
  description: "⛏️ Minar y obtener recompensas épicas"
};
handler.command = /^(minar|mine|miming)$/i;
handler.register = true;

export default handler;

/* ================= HELPERS ================= */

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function msToTime(ms) {
  let s = Math.floor((ms / 1000) % 60);
  let m = Math.floor((ms / 1000 / 60) % 60);
  return `${m}m ${s}s`;
}
