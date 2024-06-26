<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { ICalendar, GoogleCalendar, OutlookCalendar } from 'datebook';
  import FileSaver from 'file-saver';
  import type { CalendarOptions } from 'datebook';
  import type { ChamberEvent } from '$lib/modules/types';

  export let event: ChamberEvent;
  let isShowingDropdown = false;

  let config: CalendarOptions;
  let clickOutsideListener: any;

  onMount(() => {
    if (typeof document !== 'undefined') {
      clickOutsideListener = document.addEventListener('mousedown', (e) => {
        if (!(e.target as HTMLElement).closest('.add-to-calendar-btn')) {
          isShowingDropdown = false;
        }
      });
    }
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('mousedown', clickOutsideListener);
    }
  });

  $: {
    config = {
      title: event.title,
      location: event.address,
      description: event.notes || event.title,
      start: new Date(event.startTime),
      end: new Date(event.endTime || Date.now())
    };
  }

  function toggleDropdown() {
    isShowingDropdown = !isShowingDropdown;
  }

  function addToGCal() {
    const googleCalendar = new GoogleCalendar(config);
    const url = googleCalendar.render();
    const win = window.open(url, '_blank');
    isShowingDropdown = false;
  }

  function addToOutlook() {
    const outlookCalendar = new OutlookCalendar(config);
    const url = outlookCalendar.render();
    const win = window.open(url, '_blank');
    isShowingDropdown = false;
  }

  function addToICal() {
    const icalendar = new ICalendar(config);
    const ics = icalendar.render();
    const blob = new Blob([ics], {
      type: 'text/calendar'
    });
    FileSaver.saveAs(blob, `${event.title}.ics`);
    isShowingDropdown = false;
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="add-to-calendar-btn" on:click|preventDefault on:click|stopPropagation>
  <button class="btn add-to-cal-main-btn" on:click={toggleDropdown}
    ><span class="fa fa-calendar-plus" /><span>Add to Calendar</span></button
  >
  <ul class={isShowingDropdown ? 'show' : ''}>
    <li>
      <button on:click={addToICal}>
        <span class="icon"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            shape-rendering="geometricPrecision"
            image-rendering="optimizeQuality"
            fill-rule="evenodd"
            viewBox="0 0 640 640"
            ><path
              d="M494.782 340.02c-.803-81.025 66.084-119.907 69.072-121.832-37.595-54.993-96.167-62.552-117.037-63.402-49.843-5.032-97.242 29.362-122.565 29.362-25.253 0-64.277-28.607-105.604-27.85-54.32.803-104.4 31.594-132.403 80.245C29.81 334.457 71.81 479.58 126.816 558.976c26.87 38.882 58.914 82.56 100.997 81 40.512-1.594 55.843-26.244 104.848-26.244 48.993 0 62.753 26.245 105.64 25.406 43.606-.803 71.232-39.638 97.925-78.65 30.887-45.12 43.548-88.75 44.316-90.994-.969-.437-85.029-32.634-85.879-129.439l.118-.035zM414.23 102.178C436.553 75.095 451.636 37.5 447.514-.024c-32.162 1.311-71.163 21.437-94.253 48.485-20.729 24.012-38.836 62.28-33.993 99.036 35.918 2.8 72.591-18.248 94.926-45.272l.036-.047z"
            /></svg
          ></span
        ><span class="btn-icon-title">Apple</span>
      </button>
    </li>
    <li>
      <button on:click={addToGCal}
        ><span class="icon"
          ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 122.88"
            ><path d="M93.78 29.1H29.1v64.68h64.68V29.1z" fill="#fff" /><path
              d="M93.78 122.88l29.1-29.1h-29.1v29.1z"
              fill="#f72a25"
            /><path d="M122.88 29.1h-29.1v64.68h29.1V29.1z" fill="#fbbc04" /><path
              d="M93.78 93.78H29.1v29.1h64.68v-29.1z"
              fill="#34a853"
            /><path d="M0 93.78v19.4c0 5.36 4.34 9.7 9.7 9.7h19.4v-29.1H0h0z" fill="#188038" /><path
              d="M122.88 29.1V9.7c0-5.36-4.34-9.7-9.7-9.7h-19.4v29.1h29.1 0z"
              fill="#1967d2"
            /><path
              d="M93.78 0H9.7C4.34 0 0 4.34 0 9.7v84.08h29.1V29.1h64.67V0h.01z"
              fill="#4285f4"
            /><path
              d="M42.37 79.27c-2.42-1.63-4.09-4.02-5-7.17l5.61-2.31c.51 1.94 1.4 3.44 2.67 4.51 1.26 1.07 2.8 1.59 4.59 1.59 1.84 0 3.41-.56 4.73-1.67 1.32-1.12 1.98-2.54 1.98-4.26 0-1.76-.7-3.2-2.09-4.32s-3.14-1.67-5.22-1.67H46.4v-5.55h2.91c1.79 0 3.31-.48 4.54-1.46 1.23-.97 1.84-2.3 1.84-3.99 0-1.5-.55-2.7-1.65-3.6s-2.49-1.35-4.18-1.35c-1.65 0-2.96.44-3.93 1.32s-1.7 2-2.12 3.24l-5.55-2.31c.74-2.09 2.09-3.93 4.07-5.52s4.51-2.39 7.58-2.39c2.27 0 4.32.44 6.13 1.32s3.23 2.1 4.26 3.65c1.03 1.56 1.54 3.31 1.54 5.25 0 1.98-.48 3.65-1.43 5.03-.95 1.37-2.13 2.43-3.52 3.16v.33c1.79.74 3.36 1.96 4.51 3.52 1.17 1.58 1.76 3.46 1.76 5.66s-.56 4.16-1.67 5.88c-1.12 1.72-2.66 3.08-4.62 4.07s-4.17 1.49-6.62 1.49c-2.84 0-5.46-.81-7.88-2.45h0 0zm34.46-27.84l-6.16 4.45-3.08-4.67 11.05-7.97h4.24v37.6h-6.05V51.43h0z"
              fill="#1a73e8"
            /></svg
          ></span
        ><span class="btn-icon-title">Google</span></button
      >
    </li>
    <li>
      <button on:click={addToICal}
        ><span class="icon"
          ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 122.88"
            ><path
              d="M81.61 4.73c0-2.61 2.58-4.73 5.77-4.73s5.77 2.12 5.77 4.73v20.72c0 2.61-2.58 4.73-5.77 4.73s-5.77-2.12-5.77-4.73V4.73h0zm-15.5 99.08c-.34 0-.61-1.43-.61-3.2s.27-3.2.61-3.2H81.9c.34 0 .61 1.43.61 3.2s-.27 3.2-.61 3.2H66.11h0zM15.85 67.09c-.34 0-.61-1.43-.61-3.2s.27-3.2.61-3.2h15.79c.34 0 .61 1.43.61 3.2s-.27 3.2-.61 3.2H15.85h0zm25.13 0c-.34 0-.61-1.43-.61-3.2s.27-3.2.61-3.2h15.79c.34 0 .61 1.43.61 3.2s-.27 3.2-.61 3.2H40.98h0zm25.13 0c-.34 0-.61-1.43-.61-3.2s.27-3.2.61-3.2H81.9c.34 0 .61 1.43.61 3.2s-.27 3.2-.61 3.2H66.11h0zm25.14 0c-.34 0-.61-1.43-.61-3.2s.27-3.2.61-3.2h15.79c.34 0 .61 1.43.61 3.2s-.27 3.2-.61 3.2H91.25h0zm-75.4 18.36c-.34 0-.61-1.43-.61-3.2s.27-3.2.61-3.2h15.79c.34 0 .61 1.43.61 3.2s-.27 3.2-.61 3.2H15.85h0zm25.13 0c-.34 0-.61-1.43-.61-3.2s.27-3.2.61-3.2h15.79c.34 0 .61 1.43.61 3.2s-.27 3.2-.61 3.2H40.98h0zm25.13 0c-.34 0-.61-1.43-.61-3.2s.27-3.2.61-3.2H81.9c.34 0 .61 1.43.61 3.2s-.27 3.2-.61 3.2H66.11h0zm25.14 0c-.34 0-.61-1.43-.61-3.2s.27-3.2.61-3.2h15.79c.34 0 .61 1.43.61 3.2s-.27 3.2-.61 3.2H91.25h0zm-75.4 18.36c-.34 0-.61-1.43-.61-3.2s.27-3.2.61-3.2h15.79c.34 0 .61 1.43.61 3.2s-.27 3.2-.61 3.2H15.85h0zm25.13 0c-.34 0-.61-1.43-.61-3.2s.27-3.2.61-3.2h15.79c.34 0 .61 1.43.61 3.2s-.27 3.2-.61 3.2H40.98h0zM29.61 4.73c0-2.61 2.58-4.73 5.77-4.73s5.77 2.12 5.77 4.73v20.72c0 2.61-2.58 4.73-5.77 4.73s-5.77-2.12-5.77-4.73V4.73h0zM6.4 45.32h110.07V21.47c0-.8-.33-1.53-.86-2.07-.53-.53-1.26-.86-2.07-.86H103c-1.77 0-3.2-1.43-3.2-3.2s1.43-3.2 3.2-3.2h10.55c2.57 0 4.9 1.05 6.59 2.74s2.74 4.02 2.74 6.59v27.06 65.03c0 2.57-1.05 4.9-2.74 6.59s-4.02 2.74-6.59 2.74H9.33c-2.57 0-4.9-1.05-6.59-2.74-1.69-1.7-2.74-4.03-2.74-6.6V48.52 21.47c0-2.57 1.05-4.9 2.74-6.59s4.02-2.74 6.59-2.74H20.6c1.77 0 3.2 1.43 3.2 3.2s-1.43 3.2-3.2 3.2H9.33c-.8 0-1.53.33-2.07.86-.53.53-.86 1.26-.86 2.07v23.85h0zm110.08 6.41H6.4v61.82c0 .8.33 1.53.86 2.07.53.53 1.26.86 2.07.86h104.22c.8 0 1.53-.33 2.07-.86.53-.53.86-1.26.86-2.07V51.73h0zM50.43 18.54c-1.77 0-3.2-1.43-3.2-3.2s1.43-3.2 3.2-3.2h21.49c1.77 0 3.2 1.43 3.2 3.2s-1.43 3.2-3.2 3.2H50.43h0z"
            /></svg
          ></span
        >
        <span class="btn-icon-title">iCal file</span></button
      >
    </li>
    <li>
      <button on:click={addToOutlook}
        ><span class="icon"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-0.129793726981 0 33.251996719421 32"
            width="2500"
            height="2397"
            ><path
              d="M28.596 2H11.404A1.404 1.404 0 0 0 10 3.404V5l9.69 3L30 5V3.404A1.404 1.404 0 0 0 28.596 2z"
              fill="#0364b8"
            /><path
              d="M31.65 17.405A11.341 11.341 0 0 0 32 16a.666.666 0 0 0-.333-.576l-.013-.008-.004-.002L20.812 9.24a1.499 1.499 0 0 0-1.479-.083 1.49 1.49 0 0 0-.145.082L8.35 15.415l-.004.002-.012.007A.666.666 0 0 0 8 16a11.344 11.344 0 0 0 .35 1.405l11.492 8.405z"
              fill="#0a2767"
            /><path d="M24 5h-7l-2.021 3L17 11l7 6h6v-6z" fill="#28a8ea" /><path
              d="M10 5h7v6h-7z"
              fill="#0078d4"
            /><path d="M24 5h6v6h-6z" fill="#50d9ff" /><path
              d="M24 17l-7-6h-7v6l7 6 10.832 1.768z"
              fill="#0364b8"
            /><path d="M17 11h7v6h-7z" fill="#0078d4" /><path
              d="M10 17h7v6h-7z"
              fill="#064a8c"
            /><path d="M24 17h6v6h-6z" fill="#0078d4" /><path
              d="M20.19 25.218l-11.793-8.6.495-.87 10.909 6.212a.528.528 0 0 0 .42-.012l10.933-6.23.496.869z"
              fill="#0a2767"
              opacity=".5"
            /><path
              d="M31.667 16.577l-.014.008-.003.002-10.838 6.174a1.497 1.497 0 0 1-1.46.091l3.774 5.061 8.254 1.797v.004A1.498 1.498 0 0 0 32 28.5V16a.666.666 0 0 1-.333.577z"
              fill="#1490df"
            /><path
              d="M32 28.5v-.738l-9.983-5.688-1.205.687a1.497 1.497 0 0 1-1.46.091l3.774 5.061 8.254 1.797v.004A1.498 1.498 0 0 0 32 28.5z"
              opacity=".05"
            /><path
              d="M31.95 28.883L21.007 22.65l-.195.11a1.497 1.497 0 0 1-1.46.092l3.774 5.061 8.254 1.797v.004a1.501 1.501 0 0 0 .57-.83z"
              opacity=".1"
            /><path
              d="M8.35 16.59v-.01h-.01l-.03-.02A.65.65 0 0 1 8 16v12.5A1.498 1.498 0 0 0 9.5 30h21a1.503 1.503 0 0 0 .37-.05.637.637 0 0 0 .18-.06.142.142 0 0 0 .06-.02 1.048 1.048 0 0 0 .23-.13c.02-.01.03-.01.04-.03z"
              fill="#28a8ea"
            /><path
              d="M18 24.667V8.333A1.337 1.337 0 0 0 16.667 7H10.03v7.456l-1.68.958-.005.002-.012.007A.666.666 0 0 0 8 16v.005V16v10h8.667A1.337 1.337 0 0 0 18 24.667z"
              opacity=".1"
            /><path
              d="M17 25.667V9.333A1.337 1.337 0 0 0 15.667 8H10.03v6.456l-1.68.958-.005.002-.012.007A.666.666 0 0 0 8 16v.005V16v11h7.667A1.337 1.337 0 0 0 17 25.667z"
              opacity=".2"
            /><path
              d="M17 23.667V9.333A1.337 1.337 0 0 0 15.667 8H10.03v6.456l-1.68.958-.005.002-.012.007A.666.666 0 0 0 8 16v.005V16v9h7.667A1.337 1.337 0 0 0 17 23.667z"
              opacity=".2"
            /><path
              d="M16 23.667V9.333A1.337 1.337 0 0 0 14.667 8H10.03v6.456l-1.68.958-.005.002-.012.007A.666.666 0 0 0 8 16v.005V16v9h6.667A1.337 1.337 0 0 0 16 23.667z"
              opacity=".2"
            /><path
              d="M1.333 8h13.334A1.333 1.333 0 0 1 16 9.333v13.334A1.333 1.333 0 0 1 14.667 24H1.333A1.333 1.333 0 0 1 0 22.667V9.333A1.333 1.333 0 0 1 1.333 8z"
              fill="#0078d4"
            /><path
              d="M3.867 13.468a4.181 4.181 0 0 1 1.642-1.814A4.965 4.965 0 0 1 8.119 11a4.617 4.617 0 0 1 2.413.62 4.14 4.14 0 0 1 1.598 1.733 5.597 5.597 0 0 1 .56 2.55 5.901 5.901 0 0 1-.577 2.666 4.239 4.239 0 0 1-1.645 1.794A4.8 4.8 0 0 1 7.963 21a4.729 4.729 0 0 1-2.468-.627 4.204 4.204 0 0 1-1.618-1.736 5.459 5.459 0 0 1-.567-2.519 6.055 6.055 0 0 1 .557-2.65zm1.75 4.258a2.716 2.716 0 0 0 .923 1.194 2.411 2.411 0 0 0 1.443.435 2.533 2.533 0 0 0 1.541-.449 2.603 2.603 0 0 0 .897-1.197 4.626 4.626 0 0 0 .286-1.665 5.063 5.063 0 0 0-.27-1.686 2.669 2.669 0 0 0-.866-1.24 2.387 2.387 0 0 0-1.527-.473 2.493 2.493 0 0 0-1.477.439 2.741 2.741 0 0 0-.944 1.203 4.776 4.776 0 0 0-.007 3.44z"
              fill="#fff"
            /></svg
          ></span
        ><span class="btn-icon-title">Outlook Web</span></button
      >
    </li>
  </ul>
</div>

<style lang="scss">
  .add-to-calendar-btn {
    width: 150px;
    position: relative;

    * {
      font-size: 10pt;
    }
    .add-to-cal-main-btn {
      background-color: #ffc4be;
      // font-size: 10pt;
      padding: 5px 8px;
      height: 30px;
      width: 100%;
    }

    ul {
      display: none;
      list-style-type: none;
      background: white;
      border: 1px solid #adadad;
      border-top: none;
      border-bottom-left-radius: 3px;
      border-bottom-right-radius: 3px;
      box-shadow: var(--subtle-shadow);
      position: absolute;
      width: 100%;

      li {
        cursor: pointer;
        border-top: 1px solid #adadad;

        button {
          border: none;
          background: none;
          padding: 5px;
          cursor: pointer;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }

        &:hover {
          background-color: #cee2f4;
        }
      }

      &.show {
        display: block;
      }
    }
  }

  .icon {
    height: 16px;
    display: inline-block;
    margin-bottom: 4px;
    margin-right: 10px;

    svg {
      height: 100%;
      color: rgb(51, 51, 51);
      width: auto;
    }
  }
</style>
