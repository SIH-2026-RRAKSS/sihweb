import os
path = 'src/services/api.ts'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

new_func = """  public static async simulateStreamBatch(dataset: 'synthetic' | 'ibm' = 'synthetic', numTx: number = 50, offset: number = 0): Promise<any> {
    const res = await fetch(`${BASE_URL}/simulate/stream?dataset=${dataset}&num_tx=${numTx}&offset=${offset}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(30000)
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return await res.json();
  }
}
"""

c = c.replace('}\n', new_func)
with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
