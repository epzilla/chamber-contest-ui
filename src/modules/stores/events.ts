import { writable } from 'svelte/store';
import rest from '../rest';
import { user } from './users';

type myEventsRsp = {
  attended: ChamberEvent[];
  unattended: ChamberEvent[];
};

export const pastEvents = writable<ChamberEvent[]>([]);
export const myEvents = writable<ChamberEvent[]>([]);
export const myUnattendedEvents = writable<ChamberEvent[]>([]);

rest.get('past-events').then((events: ChamberEvent[]) => {
  events.sort((a, b) => {
    const aTime = new Date(a.startTime);
    const bTime = new Date(b.startTime);
    return bTime.getTime() - aTime.getTime();
  });
  pastEvents.set(events);
});

user.subscribe(u => {
  if (u) {
    rest
      .get(`events-by-member/${u.id}`)
      .then(({ attended, unattended }: myEventsRsp) => {
        attended.sort((a, b) => {
          const aTime = new Date(a.startTime);
          const bTime = new Date(b.startTime);
          return bTime.getTime() - aTime.getTime();
        });
        myEvents.set(attended);
        unattended.sort((a, b) => {
          const aTime = new Date(a.startTime);
          const bTime = new Date(b.startTime);
          return bTime.getTime() - aTime.getTime();
        });
        myUnattendedEvents.set(unattended);
      });
  }
});
