import axios from "axios";

const cache = new Map(); // same keyword dobara search na ho

// 1) Pexels se image
const fromPexels = async (key) => {
  if (!process.env.PEXELS_API_KEY) return null;
  try {
    const { data } = await axios.get("https://api.pexels.com/v1/search", {
      params: { query: key, per_page: 1, orientation: "landscape" },
      headers: { Authorization: process.env.PEXELS_API_KEY },
      timeout: 8000,
    });
    return data?.photos?.[0]?.src?.large || null;
  } catch (error) {
    console.log("Pexels error:", error.message);
    return null;
  }
};

// 2) Pixabay se image
const fromPixabay = async (key) => {
  if (!process.env.PIXABAY_API_KEY) return null;
  try {
    const { data } = await axios.get("https://pixabay.com/api/", {
      params: {
        key: process.env.PIXABAY_API_KEY,
        q: key,
        image_type: "photo",
        orientation: "horizontal",
        safesearch: true,
        per_page: 3,
      },
      timeout: 8000,
    });
    const hit = data?.hits?.[0];
    return hit?.largeImageURL || hit?.webformatURL || null;
  } catch (error) {
    console.log("Pixabay error:", error.message);
    return null;
  }
};

// 3) Picsum: aakhri fallback, hamesha chalta hai (par random photo)
const fromPicsum = (key) =>
  `https://picsum.photos/seed/${encodeURIComponent(key)}/800/600`;

// keyword se image URL laata hai: Pexels -> Pixabay -> Picsum
const getImageUrl = async (keyword) => {
  const key = keyword.toLowerCase().trim();
  if (cache.has(key)) return cache.get(key);

  const url =
    (await fromPexels(key)) || (await fromPixabay(key)) || fromPicsum(key);

  cache.set(key, url);
  return url;
};

const PLACEHOLDER = /\[\[img:([^\]]+)\]\]/g;

// saari files me [[img:keyword]] ko asli URL se badal deta hai
export const injectImages = async (files) => {
  const keywords = new Set();
  files.forEach((f) => {
    for (const m of (f.content || "").matchAll(PLACEHOLDER)) {
      keywords.add(m[1].trim());
    }
  });

  const urls = {};
  await Promise.all(
    [...keywords].map(async (k) => {
      urls[k] = await getImageUrl(k);
    }),
  );

  return files.map((f) => ({
    ...f,
    content: (f.content || "").replace(PLACEHOLDER, (_, k) => urls[k.trim()]),
  }));
};
