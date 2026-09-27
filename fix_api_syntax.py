import os

path = 'src/services/api.ts'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

bad_func = """
  public static async simulateStreamBatch(dataset: 'synthetic' | 'ibm' = 'synthetic', numTx: number = 50, offset: number = 0): Promise<any> {
    const res = await fetch(${BASE_URL}/simulate/stream?dataset=&num_tx=&offset=, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(30000)
    });
    if (!res.ok) throw new Error(API Error: );
    return await res.json();
  }
"""

good_func = """
  public static async simulateStreamBatch(dataset: 'synthetic' | 'ibm' = 'synthetic', numTx: number = 50, offset: number = 0): Promise<any> {
    const res = await fetch(`${BASE_URL}/simulate/stream?dataset=${dataset}&num_tx=${numTx}&offset=${offset}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(30000)
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return await res.json();
  }
"""

c = c.replace(bad_func.strip(), good_func.strip())

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('Fixed api.ts syntax')
