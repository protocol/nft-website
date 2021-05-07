<template>
  <div class="legacy-callout">
    <p>
      <b>Help us improve this site!</b>
    </p>
    <section>
      <div class="block">
        <ul>
          <li>
            <a
              href="https://github.com/ipfs/ipfs-docs/issues/new?assignees=&labels=OKR+3%3A+Content+Improvement%2C+docs-ipfs&template=content-request.md&title=%5BCONTENT+REQUEST%5D+%28add+your+title+here%21%29"
              target="_blank"
              rel="noopener noreferrer"
              >Suggest new content</a
            >
          </li>
          <li>
            <a
              href="https://ipfs.canny.io/docs-features"
              target="_blank"
              rel="noopener noreferrer"
              >Request features</a
            >
          </li>
        </ul>
      </div>
      <div class="block">
        <ul>
          <li>
            <a
              href="https://github.com/ipfs/ipfs-docs/issues/new?assignees=&labels=OKR+3%3A+Content+Improvement%2C+docs-ipfs&template=documentation-issue.md&title=%5BDOCS+ISSUE%5D+%28add+your+title+here%21%29"
              target="_blank"
              rel="noopener noreferrer"
              >Give general feedback</a
            >
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style lang="stylus" scoped>
.legacy-callout {
  background-color: lighten($badgeTipColor, 95%);
  color: lighten($textColor, 20%);
  border-color: $badgeTipColor;
  padding: 1rem 2rem;
  margin-top: 3rem;
}

.legacy-links a {
  font-weight: 400;
}

section {
  margin: 1rem 0;

  ul {
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      margin: 0;
      line-height: 2em;
      padding: 0;
    }
  }
}

@media (min-width: $MQNarrow) {
  section {
    display: flex;

    .block {
      flex: 1;
    }
  }
}
</style>
