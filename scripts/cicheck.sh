#!/bin/bash

git config --global user.name "$GH_USERNAME"
git config --global user.email "$GH_USER_EMAIL"

BRANCHNAME='$PR_HEAD_REF'
echo "Testing on commit range: $FIRST_COMMIT..$LAST_COMMIT"
CHANGED_FILES=`(git diff --name-only $FIRST_COMMIT..$LAST_COMMIT)`
echo "Changed files: "
echo $CHANGED_FILES

# Skip page checks if branch name has "ciskip" in it
DO_PAGE_CHECKS=1
if [[ $BRANCHNAME == *"ciskip"* ]]; then
  DO_PAGE_CHECKS=0
fi

# Image optimization
PNGS_CHANGED=`(echo "$CHANGED_FILES" | grep .png)`
if [ -z "$PNGS_CHANGED" ]; then
    echo "No changed PNGs"
else
  echo "Compressing PNGs..."
  for png in $PNGS_CHANGED; do
    optipng -o 7 $png
  done
fi

JPGS_CHANGED=`(echo "$CHANGED_FILES" | grep .jpg)`
if [ -z "$JPGS_CHANGED" ]; then
    echo "No changed JPGs"
else
  echo "Compressing JPGs..."
  for jpg in $JPGS_CHANGED; do
    jpegoptim -f --strip-all $jpg
  done
fi

GIFS_CHANGED=`(echo "$CHANGED_FILES" | grep .gif)`
if [ -z "$GIFS_CHANGED" ]; then
    echo "No changed GIFs"
else
  echo "Compressing GIFs..."
  for gif in $GIFS_CHANGED; do
    optipng -o 7 $gif
  done
fi

SVGS_CHANGED=`(echo "$CHANGED_FILES" | grep .svg)`
if [ -z "$SVGS_CHANGED" ]; then
    echo "No changed SVGs"
else
  echo "Compressing SVGs..."
  for svg in $SVGS_CHANGED; do
    scour -i "$svg" -o "$svg-opt"
    mv "$svg-opt" "$svg"
  done
fi

if [ -z "$(git status --porcelain)" ]; then
  # Working directory clean
  COMMENT="$COMMENT
- Image optimization came back clean!"
else
  # Uncommitted changes
  git remote add fdocs https://$${GH_TOKEN}@github.com/protocol/nft-website.git > /dev/null 2>&1
  git fetch fdocs
  git checkout --track origin/$PR_HEAD_REF
  git pull
  git add .
  git commit -m "Automatically optimized images. [ciskip]"
  git push
  COMMENT="$COMMENT
- I optimized some images for you! See the commit with the comment \`Automatically optimized images [ciskip]\` in this PR for details."
fi

echo "Run npm install"
npm install
echo "Run docs build"
BUILDRESULT=$(npm run docs:build 2>&1)

if [[ $? -eq 0 ]]; then
  echo "Vuepress build was successful!"
  COMMENT="$COMMENT
- Vuepress build was successful!"
else
  echo "Vuepress build failed. Creating PR comment with the details."
  COMMENT="$COMMENT
- Vuepress build failed...

\`\`\`
$BUILDRESULT
\`\`\`"
fi

if [[ $DO_PAGE_CHECKS -eq 1 ]]; then
  echo "Run the language checker..."
  MDS_CHANGED=`(echo "$CHANGED_FILES" | grep .md)`
  if [ -z "$MDS_CHANGED" ]; then
    COMMENT="$COMMENT
- No markdown files were changed, so no page checks were run!"
  else
    for md in $MDS_CHANGED; do
      LANGCHECK=$(python scripts/page-checker.py $md $LANGUAGETOOLS_USERNAME $LANGUAGETOOLS_API_KEY)
      echo $LANGCHECK
      COMMENT="$COMMENT
$LANGCHECK"
    done
  fi
else
  COMMENT="$COMMENT
- Skipped doing per-page checks because branch name included \`ciskip\`."
fi
echo "Here is the comment I'm sending to GitHub:"
echo $COMMENT

echo "Delete old bot comments:"
OLDCOMMENTSJSON=$(curl -H "Authorization: token $GH_TOKEN"  -X GET https://api.github.com/repos/protocol/nft-website/issues/$PR_NUMBER/comments)
OLDCOMMENTS=$(echo $OLDCOMMENTSJSON | jq ".[] | select(.user.id==$GH_USER_ID) | .id" --jsonargs)

for i in $OLDCOMMENTS; do curl -i -H "Authorization: token $GH_TOKEN" -X DELETE https://api.github.com/repos/protocol/nft-website/issues/comments/$i; done

echo "Post the new bot comment!"
JSONIFIED_COMMENT="$( jq -nc --arg str "$COMMENT" '{"body": $str}' )"
echo -e ">> Sending results in a comment on the Github pull request #$PR_NUMBER:"
curl -i -H "Authorization: token $GH_TOKEN" \
    -H "Content-Type: application/json" \
    -X POST -d "$JSONIFIED_COMMENT" \
    https://api.github.com/repos/protocol/nft-website/issues/$PR_NUMBER/comments
