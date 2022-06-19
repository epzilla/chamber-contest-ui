<script>
  export let text = '';
  export let color = '#ccc';
  export let style = {};
  /**
   * Where to place the text. If not provided, defaults to "start", placing the text
   * on the left for an LTR layout, with line extending all the way to the right.
   * For "center", the text will be centered, with lines before and after.
   * For "end", in a LTR layout, the text will be on the right with a line extending
   * all the wayt to the left.
   */
  export let align = 'start'; // 'start' | 'center' | 'end';

  // h4 element rendered
  let el;

  function getStyles(color, style) {
    let styles = {};
    if (style) {
      styles = style;
    }
    if (color) {
      styles.color = color;
      el?.style.setProperty('--heading-with-extender-color', color);
    }
    return styles;
  }
  $: {
    if (color && el) {
      el.style.setProperty('--heading-with-extender-color', color);
    }
  }
</script>

<h4
  class={`heading-with-extender-lines alignment-${align}`}
  style={getStyles(color, style)}
  bind:this={el}
>
  {text}
</h4>

<style lang="scss">
  .heading-with-extender-lines {
    display: grid;
    align-items: center;
    grid-template-columns: auto 1fr;
    gap: 10px;
    margin: 1rem 0;
    width: 100%;
    color: var(--heading-with-extender-color);
    font-size: 10pt;
    font-weight: 700;
    text-transform: uppercase;

    &:before,
    &:after {
      content: '';
      margin-top: 3px;
      border-bottom: 2px solid var(--heading-with-extender-color);
    }

    &.alignment-center {
      grid-template-columns: 1fr auto 1fr;
    }

    &.alignment-start {
      grid-template-columns: auto 1fr;

      &:before {
        display: none;
      }
    }

    &.alignment-end {
      grid-template-columns: 1fr auto;

      &:after {
        display: none;
      }
    }
  }
</style>
