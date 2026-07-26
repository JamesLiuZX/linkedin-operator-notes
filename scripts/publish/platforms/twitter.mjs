import { createHmac, randomBytes } from "node:crypto";

function percentEncode(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) =>
    `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function oauthHeader(method, url, params, consumerSecret, tokenSecret) {
  const oauth = {
    oauth_consumer_key: params.apiKey,
    oauth_nonce: randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: params.accessToken,
    oauth_version: "1.0",
  };

  const baseParams = { ...oauth };
  const paramString = Object.keys(baseParams)
    .sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(baseParams[k])}`)
    .join("&");

  const baseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(paramString),
  ].join("&");

  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;
  const signature = createHmac("sha1", signingKey).update(baseString).digest("base64");
  oauth.oauth_signature = signature;

  return (
    "OAuth " +
    Object.keys(oauth)
      .sort()
      .map((k) => `${percentEncode(k)}="${percentEncode(oauth[k])}"`)
      .join(", ")
  );
}

async function postTweet(text, { replyTo = null, credentials }) {
  const url = "https://api.twitter.com/2/tweets";
  const body = { text };
  if (replyTo) body.reply = { in_reply_to_tweet_id: replyTo };

  const auth = oauthHeader(
    "POST",
    url,
    credentials,
    credentials.apiSecret,
    credentials.accessSecret
  );

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Twitter API error: ${JSON.stringify(data)}`);
  }
  return data.data;
}

export async function publishToTwitter(item, { config, transform }) {
  const credentials = config.twitter;
  const tweets = transform.toThread(item, config.siteUrl);

  if (!tweets.length) {
    throw new Error("Twitter thread is empty");
  }

  const tweetIds = [];
  let replyTo = null;

  for (const text of tweets) {
    const result = await postTweet(text, { replyTo, credentials });
    tweetIds.push(result.id);
    replyTo = result.id;
  }

  return {
    ok: true,
    platform: "twitter",
    status: "published",
    tweetIds,
    url: `https://twitter.com/i/web/status/${tweetIds[0]}`,
  };
}
