<script lang="ts">
  import DateTime from '$lib/components/DateTime.svelte';
  import rest from '$lib/modules/rest';
  import InfiniteScroll from 'svelte-infinite-scroll';
  import type { PageData } from './$types';

  export let data: PageData;
  const { initialFeed } = data;
  let page = 1;

  $: feed = [...initialFeed];

  function loadMas() {
    page++;
    rest.get(`feed?page=${page}`).then((data) => {
      feed = [...feed, ...data];
    });
  }
</script>

<h3>Activity Feed</h3>
<section class="activity-feed">
  <h5><span class="indent">Activity</span><span>Logged at:</span></h5>
  <ul>
    {#each feed as feedEntry}
      <li class="feed-entry">
        <span>
          <span class="bold">{feedEntry.name}</span><span>:</span>
          <span>{feedEntry.title} on </span>
          <DateTime date={feedEntry.start_time} dateFormat="M/d" />
        </span>
        <DateTime date={feedEntry.timestamp} dateFormat="M/d hh:mm aaa" />
      </li>
    {/each}
    <InfiniteScroll on:loadMore={loadMas} threshold={20} />
  </ul>
</section>

<style lang="scss">
  .activity-feed {
    width: 100%;
    max-width: 700px;
    overflow: hidden;
  }

  h3 {
    margin-top: 0;
    margin-bottom: 1rem;
  }

  h5 {
    display: grid;
    grid-template-columns: 1fr 135px;
    gap: 10px;
    margin: 0 0 10px 0;

    .indent {
      padding-left: 10px;
    }

    @media screen and (max-width: 600px) {
      grid-template-columns: 1fr 120px;
    }
  }

  ul {
    width: 100%;
    max-height: calc(100% - 40px);
    overflow-y: scroll;
    margin-top: 0;
  }

  li {
    background-color: white;
    padding: 10px;
    border-bottom: 1px solid #ccc;
    display: grid;
    grid-template-columns: 1fr 110px;
    gap: 10px;

    &:last-of-type {
      border-bottom: none;
    }

    .bold {
      font-weight: 700;
    }
  }
</style>
