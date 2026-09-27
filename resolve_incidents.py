import os
import re

path = 'src/components/incidents/IncidentQueue.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

conflict = """<<<<<<< HEAD
    let intervalId: ReturnType<typeof setTimeout>;

    const fetchIncidents = async () => {
      try {
        setLoading(true);
        if (search) {
          const val = InputValidator.validateSearchQuery(search);
          if (!val.isValid) {
            setError(val.error || 'Invalid search query');
            setLoading(false);
            return;
          }
          setError(null);
        }

=======
    let intervalId: ReturnType<typeof setInterval>;
    let isInitial = true;

    const fetchIncidents = async () => {
      try {
        if (isInitial) {
          setLoading(true);
        }
>>>>>>> origin/Deployment"""

resolved = """    let intervalId: ReturnType<typeof setInterval>;
    let isInitial = true;

    const fetchIncidents = async () => {
      try {
        if (isInitial) {
          setLoading(true);
        }
        
        if (search) {
          const val = InputValidator.validateSearchQuery(search);
          if (!val.isValid) {
            setError(val.error || 'Invalid search query');
            setLoading(false);
            return;
          }
          setError(null);
        }
"""

c = c.replace(conflict, resolved)
with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('IncidentQueue resolved')
