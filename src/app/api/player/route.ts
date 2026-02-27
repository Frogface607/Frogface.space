import { readFile } from "fs/promises";
import { join } from "path";

async function readJson<T>(filename: string, fallback: T): Promise<T> {
  try {
    const content = await readFile(join(process.cwd(), "data", filename), "utf-8");
    return JSON.parse(content);
  } catch {
    return fallback;
  }
}

export async function GET() {
  const [player, rpg] = await Promise.all([
    readJson("player.json", {}),
    readJson("rpg-system.json", { achievements: [], buffs: [], streaks: {} }),
  ]);

  return Response.json({ player, ...rpg });
}
