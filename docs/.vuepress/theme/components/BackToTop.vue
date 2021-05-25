<template>
  <transition name="fade">
    <svg
        v-if="show"
        class="go-to-top"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 45 26"
        @click="scrollToTop"
    >
        <path
            d="M19.989 5.004l-5 .003.004 5 5-.003zM14.992 10.008l-5 .003.004 5 5-.003zM9.996 15.011l-5 .004.004 5 5-.004zM5 20.015l-5 .004.004 5 5-.004zM20.004 0l5 .004-.004 5L20 5zM25 5.004l5 .004-.004 5-5-.004zM29.996 10.008l5 .004-.004 5-5-.004z"
        />
        <path
            d="M34.992 15.011l5 .004-.004 5-5-.004zM39.989 20.015l5 .004-.004 5-5-.004z"
        />
    </svg>
  </transition>
</template>

<script>
import debounce from 'lodash.debounce'
export default {
  name: 'BackToTop',
  props: {
    threshold: {
      type: Number,
      default: 300
    }
  },
  data () {
    return {
      scrollTop: null
    }
  },
  computed: {
    show () {
      return this.scrollTop > this.threshold
    }
  },
  mounted () {
    this.scrollTop = this.getScrollTop()
    window.addEventListener('scroll', debounce(() => {
      this.scrollTop = this.getScrollTop()
    }, 100))
  },
  methods: {
    getScrollTop () {
      return window.pageYOffset
        || document.documentElement.scrollTop
        || document.body.scrollTop || 0
    },
    scrollToTop () {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      this.scrollTop = 0
    }
  }
}
</script>

<style lang='stylus' scoped>
.go-to-top {
  cursor: pointer;
  position: sticky;
  align-self: flex-end;
  bottom: 2rem;
  margin-right: 1.5rem;
  margin-bottom: -1rem;
  width: 2rem;
  color: $accentColor;
  z-index: 1;
  padding: 1rem;
  filter: drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.2));

  transition: color 0.3s;
}

.go-to-top:hover {
  color: lighten($accentColor, 30%);
}

@media (max-width: 959px) {
  .go-to-top {
    display: none;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>