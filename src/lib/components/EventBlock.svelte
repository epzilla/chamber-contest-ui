<script lang="ts">
	import type { ChamberEvent } from '$lib/modules/types';
	import { userAttendedEvents } from '../modules/stores';

	import AddToCalendarButton from './AddToCalendarButton.svelte';
	import AttendanceNotice from './AttendanceNotice.svelte';
	import DateTime from './DateTime.svelte';

	export let event: ChamberEvent;
	export let isUpcomingEvent: boolean = false;
	$: didAttend = $userAttendedEvents.find((e) => e.id === event.id);
	$: evType = event?.eventType[0];
</script>

<li class="event" class:attended={didAttend}>
	<a href={`/events/${event.id}`}>
		<h3 class="event-title" class:with-att-mark={didAttend}>
			<span class="underline-on-hover">{event.title}</span>
			<span class="fa fa-check-circle" />
		</h3>
		<h5 class="type-and-points-info">
			<span>{evType.label}</span>
			{#if !didAttend}
				<span> - {evType.points}</span>
				<span>{evType.points > 1 ? 'points' : 'point'}</span>
			{/if}
		</h5>
		<p class="event-date"><DateTime date={event.startTime} /></p>
		{#if didAttend}
			<AttendanceNotice event={didAttend} />
		{/if}
		{#if isUpcomingEvent}
			<AddToCalendarButton {event} />
		{/if}
	</a>
</li>

<style lang="scss">
	.event {
		background-color: white;
		border: 1px solid #ddd;
		box-shadow: var(--subtle-shadow);
		width: 100%;
		margin: 1rem 0;
		a {
			display: block;
			text-decoration: none;
			color: var(--colorDefaultText);
			padding: 1rem;

			h3.event-title {
				margin: 5px 0;
				font-weight: 600;

				.fa {
					display: none;
					color: var(--colorAttendedEvent);
				}
			}

			h5 {
				margin: 5px 0;

				&.type-and-points-info {
					color: var(--colorMediumText);
					font-weight: 400;
				}

				&.att-notif {
					margin: 10px 0;
				}
			}
		}
		&.attended {
			h3 {
				display: grid;
				grid-template-columns: 1fr 20px;
				.fa {
					display: inline-block;
				}
			}
		}
	}

	@media screen and (max-width: 600px) {
		.event {
			h5 {
				width: 100%;
			}
		}
	}
</style>
