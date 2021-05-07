<template>
  <div class="number-block">
    <div v-for="{ value, text } in items" class="number-block-item">
      <div class="number-block-number">{{ value }}</div>
      <div>{{ text }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NumberBlock',
  props: {
    items: {
      type: Array,
      default: []
    }
  }
}
</script>

<style lang="stylus">
.number-block-item {
  background-color: lighten($accentColor, 80%);
  margin-top: 1em;
  padding: 1em;
  text-align: center;
}

.number-block-number {
  color: $accentColor;
  font-size: 3em;
  font-weight: 700;
}

@media (min-width: $MQNarrow) {
  .number-block {
    display: flex;
    margin-top: 1em;
  }

  .number-block-item {
    flex: 1 1 0;
    margin-right: 1em;
  }

  .number-block-item:last-child {
    margin-right: 0;
  }
}
</style>
