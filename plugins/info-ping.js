const handler = async (message) => {
const start = Date.now();
const sent = await message.reply("🏓 Ping...");
const latency = Date.now() - start;
await sent.edit(`🏓 Pong: ${latency}ms`);
};
handler.help = ['ping'];
handler.tags = ['main'];
handler.command = /^(ping|p)$/i;
handler.register = true;
export default handler;
