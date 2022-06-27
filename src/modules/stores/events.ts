import { writable } from 'svelte/store';
import rest from '../rest';

export const pastEvents = writable<ChamberEvent[]>([]);

rest.get('past-events').then((data: ChamberEvent[]) => {
  data.sort((a, b) => {
    const aTime = new Date(a.startTime);
    const bTime = new Date(b.startTime);
    return bTime.getTime() - aTime.getTime();
  });
  pastEvents.set(data);
});
