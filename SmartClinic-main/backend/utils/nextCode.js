const pad = (n) => String(n).padStart(4, '0');

function escapeRegex(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractNumber(code = '', prefix = '') {
  const s = String(code);
  if (!s.startsWith(prefix)) return 0;
  const part = s.slice(prefix.length);
  const n = Number.parseInt(part, 10);
  return Number.isFinite(n) ? n : 0;
}

async function nextCode(Model, field, prefix) {
  const regex = new RegExp(`^${escapeRegex(prefix)}\\d+$`);
  const docs = await Model.find({ [field]: { $regex: regex } }, { [field]: 1, _id: 0 }).lean();
  const max = docs.reduce((m, d) => {
    const n = extractNumber(d?.[field], prefix);
    return n > m ? n : m;
  }, 0);
  return `${prefix}${pad(max + 1)}`;
}

module.exports = { nextCode };
