function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function repairJson(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {}

  let inString = false;
  let escaped = false;
  const stack: string[] = [];

  for (const ch of value) {
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\" && inString) {
      escaped = true;
      continue;
    }
    if (ch === "\"") {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") stack.push("}");
    else if (ch === "[") stack.push("]");
    else if (ch === "}" || ch === "]") stack.pop();
  }

  const suffix = (inString ? "\"" : "") + stack.reverse().join("");
  if (!suffix) return null;

  const trimmed = value.replace(/,\s*$/, "");
  try {
    return JSON.parse(trimmed + suffix);
  } catch {}

  const lastComma = trimmed.lastIndexOf(",");
  if (lastComma > 0) {
    try {
      return JSON.parse(trimmed.slice(0, lastComma) + suffix);
    } catch {}
  }

  return null;
}

export function parseJsonObject(raw: string): Record<string, unknown> | null {
  const direct = repairJson(raw.trim());
  if (isRecord(direct)) return direct;

  const start = raw.indexOf("{");
  if (start === -1) return null;

  const fromStart = repairJson(raw.slice(start));
  if (isRecord(fromStart)) return fromStart;

  let depth = 0;
  let end = -1;
  let inString = false;
  let escaped = false;

  for (let i = start; i < raw.length; i++) {
    const ch = raw[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\" && inString) {
      escaped = true;
      continue;
    }
    if (ch === "\"") {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  if (end === -1) return null;
  const extracted = repairJson(raw.slice(start, end + 1));
  return isRecord(extracted) ? extracted : null;
}
