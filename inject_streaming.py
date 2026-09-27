import os

path = 'src/components/streaming/StreamingMonitorView.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Add error state
c = c.replace(
    'const [liveStreamEvents, setLiveStreamEvents] = useState<any[]>([]);',
    'const [liveStreamEvents, setLiveStreamEvents] = useState<any[]>([]);\n  const [error, setError] = useState<string | null>(null);'
)

# Add catch
c = c.replace(
    'ApiService.getStreamingBenchmark().then(setBench);',
    'ApiService.getStreamingBenchmark().then(setBench).catch((err) => {\n      console.error(err);\n      setError("Backend API offline");\n    });'
)

# Add banner
c = c.replace(
    '{/* ?????? INTERACTIVE RISK FACTOR & VISIBILITY CONTROL DECK ?????? */}',
    '{error && <div className="bg-red-50 p-3 mb-4 rounded text-red-600 font-bold text-sm">{error}</div>}\n      {/* ?????? INTERACTIVE RISK FACTOR & VISIBILITY CONTROL DECK ?????? */}'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed StreamingMonitorView.tsx')
