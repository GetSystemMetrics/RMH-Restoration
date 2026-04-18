// api/restore.js
import { kv } from '@vercel/kv';
import axios from 'axios';

export default async function handler(req, res) {
  const { guild_id, secret } = req.query;

  if (secret !== "nana_alt") {
    return res.status(403).send("Forbidden");
  }

  if (!guild_id) {
    return res.status(400).send("guild_id is missing");
  }

  try {
    const userIds = await kv.smembers('user_list');
    let successCount = 0;
    let failCount = 0;

    for (const userId of userIds) {
      const userData = await kv.get(`user:${userId}`);

      if (!userData || !userData.access_token) continue;

      try {
        await axios.put(
          `https://discord.com/api/guilds/${guild_id}/members/${userId}`,
          { access_token: userData.access_token },
          {
            headers: {
              Authorization: `Bot ${process.env.BOT_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        );
        successCount++;
      } catch (err) {
        console.error(`${userId} 추가 실패:`, err.response?.data || err.message);
        failCount++;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    res.json({
      message: "Success",
      total: userIds.length,
      success: successCount,
      fail: failCount
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}