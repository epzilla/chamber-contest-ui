import { writable } from 'svelte/store';
import rest from '../rest';
import { user } from './users';

type myEventsRsp = {
  attended: ChamberEvent[];
  unattended: ChamberEvent[];
  attendedAdHoc: ChamberEvent[];
  attendedNonAdHoc: ChamberEvent[];
};

function sortEventsByTime(a: ChamberEvent, b: ChamberEvent) {
  const aTime = new Date(a.startTime);
  const bTime = new Date(b.startTime);
  return bTime.getTime() - aTime.getTime();
}

export const pastEvents = writable<ChamberEvent[]>([]);
export const myEvents = writable<ChamberEvent[]>([]);
export const myUnattendedEvents = writable<ChamberEvent[]>([]);

rest.get('past-events').then((events: ChamberEvent[]) => {
  events.sort(sortEventsByTime);
  pastEvents.set(events);
});

user.subscribe(u => {
  if (u) {
    rest
      .get(`events-by-member/${u.id}`)
      .then(({ attended, unattended }: myEventsRsp) => {
        attended.sort(sortEventsByTime);
        unattended.sort(sortEventsByTime);
        myEvents.set(attended);
        myUnattendedEvents.set(unattended);
      });
  }
});
