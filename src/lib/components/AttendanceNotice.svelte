<script lang="ts">
	import { editingAttendedEvent } from '../modules/stores/users';
	import { configData } from '../modules/stores/config';
	import type { AttendedChamberEvent } from '$lib/modules/types';
	export let event: AttendedChamberEvent | null = null;

	$: evType = event?.eventType[0];

	function getUrlForContest() {
		const now = new Date();
		const start = new Date(event?.startTime ?? Date.now());
		if (now.getFullYear() === start.getFullYear() && now.getMonth() === start.getMonth()) {
			return '/contest';
		} else {
			return `/contest/monthly/${start.getMonth() + 1}-${start.getFullYear()}`;
		}
	}

	function onEdit() {
		editingAttendedEvent.set(event);
	}
</script>

{#if evType}
	<a class="attendance-highlight" href={getUrlForContest()}
		><span>
			You earned {evType.points}
			{evType.points > 1 ? 'points' : 'point'} for attending!
		</span>
		<span class="fa fa-circle-arrow-right" />
	</a>

	{#if !$configData.submissionsDisabled}
		<button on:click|preventDefault|stopPropagation={onEdit}>
			<span class="fa fa-pen-to-square" />
			<span>Edit Your Attendance</span>
		</button>
	{/if}
{/if}

<style lang="scss">
	@import '../styles/modal-form.scss';

	a.attendance-highlight {
		padding: 8px;
		color: white;
		text-decoration: none;
		margin: 10px 0;
	}

	@media screen and (max-width: 600px) {
		a.attendance-highlight {
			width: 100%;
			display: grid;
			grid-template-columns: 1fr 1rem;
			align-items: center;
		}
	}

	@media screen and (min-width: 600px) {
		a.attendance-highlight {
			color: white;
			display: inline-block;
			padding: 0.5rem;
			span:first-child {
				margin-right: 10px;
			}
		}
	}
</style>
