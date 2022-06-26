<div class="attendance-form">
  <slot />
</div>

<style lang="scss">
  :global(.attendance-form) {
    display: flex;
    flex-direction: column;
    border: 8px solid;
    border-image: linear-gradient(to left, #743ad5, #d53a9d) 1;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
    height: 100%;
    width: 100%;
    padding: 20px;
    overflow: auto;

    :global(.form-group) {
      margin-bottom: 25px;

      label {
        margin-bottom: 5px;
      }
      input {
        height: unset;

        &[type='checkbox'] {
          height: 24px;
          width: 24px;
        }

        &.name-input {
          border: 1px solid #ccc;
          height: 30px;
        }
      }
    }
  }
</style>
