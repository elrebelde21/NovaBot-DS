import fetch from 'node-fetch';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { AttachmentBuilder } from 'discord.js';

let handler = async (message, { prefix, command, text}) => {
  if (!text) return message.reply(`⚠️ Ingresa un texto para crear una imagen.\n\n### **Ejemplo:** ${prefix + command} gatitos llorando`);
  
  try {
    const imageUrl = await flux(text);
    if (imageUrl) {
      const attachment = new AttachmentBuilder(imageUrl, { name: 'imagen-generada.jpg' });
      await message.reply({
        content: `💫 Resultado para: ${text}\n✨ Imagen generada por IA ✨`,
        files: [attachment],
      });
    } else {
      throw new Error('No se pudo obtener la imagen desde la API flux.');
    }
  } catch (e1) {
    console.log('[❗] Error en la API flux: ', e1);

    try {
      const url = `https://eliasar-yt-api.vercel.app/api/ai/text2img?prompt=${encodeURIComponent(text)}`;
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);
      const attachment = new AttachmentBuilder(buffer, { name: 'imagen-generada.jpg' });
      await message.reply({
        content: `💫 Resultado para: ${text}\n✨ Imagen generada por IA (API alterna) ✨`,
        files: [attachment],
      });
    } catch (error) {
      console.log('[❗] Ninguna API funcional: ', error);
      await message.react('❌');
      await message.reply('❌ Error procesando tu solicitud. Intenta de nuevo más tarde.');
    }
  }
};
handler.help = ["dalle"]
handler.tags = ["tools"]
handler.command = ['dall-e', 'dalle', 'ia2', 'cimg', 'openai3', 'a-img', 'aimg', 'imagine'];
handler.register = true
handler.rowner = false
handler.admin = false
handler.botAdmin = false
export default handler;

const flux = async (prompt) => {
  const url = `https://lusion.regem.in/access/flux.php?prompt=${encodeURIComponent(prompt)}`;
  const headers = {
    Accept: '*/*',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
    Referer: 'https://lusion.regem.in/?ref=taaft&utm_source=taaft&utm_medium=referral',
  };
  const response = await fetch(url, { headers });
  const html = await response.text();
  const $ = cheerio.load(html);
  return $('a.btn-navy.btn-sm.mt-2').attr('href') || null;
};