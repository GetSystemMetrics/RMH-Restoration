// api/callback.js
import { kv } from '@vercel/kv';
import axios from 'axios';

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("코드가 없습니다.");
  }

  try {
    const response = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.REDIRECT_URI,
      scope: 'identify guilds.join',
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token, refresh_token } = response.data;

    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const userId = userResponse.data.id;

    await kv.sadd('user_list', userId);
    await kv.set(`user:${userId}`, {
      access_token,
      refresh_token
    });

    res.send("✅");
  } catch (error) {
    console.error("에러 발생:", error.response?.data || error.message);
    res.status(500).send("인증 실패");
  }
}