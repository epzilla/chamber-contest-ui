<script>
  import { getStores } from '$app/stores';
  import { currentMatch } from '../modules/stores';
  import { MENU, ROUTES, SITE_TITLE } from '../modules/constants';
  import { isEmpty } from '../modules/helpers';
  const { page } = getStores();

  export let match = {};

  let view = '';
  let menu = false;
  $: backdropClass = `nav-modal-backdrop${menu ? ' show' : ''}`;
  $: shownRoutes = isEmpty(match)
    ? ROUTES.filter((r) => !r.hideIfNoMatch)
    : ROUTES.filter((r) => !r.hideIfMatchInProgress);

  page.subscribe(({ path }) => (view = path));
  currentMatch.subscribe((m) => (match = m));

  function toggleMenu() {
    menu = !menu;
  }
</script>

<header class="header">
  <button class="btn menu-btn" on:click={toggleMenu}>{MENU}</button>
  <a href="/" tabindex="0"><h1>{SITE_TITLE}</h1></a>
  <nav class={menu ? 'show' : 'hide'}>
    {#each shownRoutes as { href, title }}
      <a
        {href}
        {title}
        class:active={view === href}
        on:click={() => (menu = false)}>{title}</a
      >
    {/each}
  </nav>
  <div class={backdropClass} on:click={toggleMenu} />
</header>

<style lang="scss">
  .header {
    position: fixed;
    display: flex;
    align-items: center;
    left: 0;
    top: 0;
    width: 100%;
    height: 56px;
    padding: 0 1rem;
    background: var(--primary);
    box-shadow: var(--subtle-shadow);
    z-index: 3;
    a {
      text-decoration: none;
      &:focus {
        outline: none;
      }
    }
    h1 {
      margin: 0 1rem 0 0;
      padding: 0;
      font-size: 24px;
      line-height: 56px;
      font-weight: 400;
      color: var(--secondary);
    }
    nav {
      font-size: 100%;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      flex-grow: 1;
      > a {
        display: flex;
        align-items: center;
        padding: 0 15px;
        min-width: 50px;
        text-align: center;
        background: rgba(255, 255, 255, 0);
        text-decoration: none;
        color: var(--secondary);
        cursor: pointer;
        will-change: background-color;
        &:hover {
          color: #fff;
        }
        &:focus {
          color: #fff;
        }
        &:active {
          color: #fff;
        }
      }
      .dropdown-header {
        display: flex;
        align-items: center;
        padding: 0 15px;
        min-width: 50px;
        text-align: center;
        background: rgba(255, 255, 255, 0);
        text-decoration: none;
        color: var(--secondary);
        cursor: pointer;
        will-change: background-color;
        &:hover {
          color: #fff;
        }
        &:focus {
          color: #fff;
        }
        &:active {
          color: #fff;
        }
      }
      > a.active {
        background: var(--tertiary);
        color: var(--activeLinkColor);
      }
      .dropdown-header.active {
        background: var(--tertiary);
        color: var(--activeLinkColor);
      }
      .dropdown-header.larger {
        display: none;
      }
      .dropdown-header.dropdown-header {
        display: flex;
        &:before {
          margin-right: 0;
        }
      }
    }
  }
  .btn.menu-btn {
    display: none;
    margin-right: 10px;
  }
  .nav-modal-backdrop {
    display: none;
  }
  @media (min-width: 800px) {
    .header {
      nav {
        flex-direction: row;
        flex-grow: 0;
        flex-shrink: 0;
        margin-left: auto;
        > a {
          display: block;
          height: 56px;
          line-height: 56px;
          flex-grow: 0;
        }
        .faux-link.larger {
          display: block;
        }
        .faux-link.smaller {
          display: none;
        }
      }
    }
  }
  @media (max-width: 800px) {
    .header {
      nav {
        flex-direction: column;
        position: fixed;
        left: -200px;
        top: 56px;
        bottom: 0;
        width: 200px;
        background-color: var(--primary);
        transition: transform 0.15s ease-in-out;
        > a {
          height: 50px;
          line-height: 50px;
          order: 2;
        }
        .order-last-smaller {
          height: 50px;
          line-height: 50px;
          order: 2;
          order: 100;
          border-top: 1px solid var(--secondary);
          border-bottom: 1px solid var(--secondary);
        }
        .flex-pull-right {
          display: flex;
          flex-direction: column;
          margin-left: initial;
          width: 200px;
        }
      }
      nav.show {
        transform: translateX(200px);
        box-shadow: 0px 0px 10px #333;
      }
      h1 {
        margin-left: auto;
      }
      .dropdown-wrapper.larger {
        .dropdown-header {
          padding: 0;
          &:before {
            display: none;
          }
        }
      }
      .order-first-smaller {
        order: 1;
        height: 70px;
        line-height: 50px;
        justify-content: center;
        border-bottom: 1px solid var(--secondary);
      }
    }
    .btn.menu-btn {
      display: inline-flex;
      height: 34px;
      background-color: var(--secondary);
      color: var(--primary);
      border: none;
    }
    .nav-modal-backdrop.show {
      display: flex;
      position: fixed;
      background-color: rgba(56, 56, 56, 0.5);
      left: 0;
      top: 56px;
      bottom: 0;
      right: 0;
      z-index: -1;
    }
  }
</style>
