const path = require('path')
const spawn = require('cross-spawn')

module.exports = (options = {}, context) => ({
    extendPageData ($page) {
        const { transformer, dateOptions } = options
        
        const timestamp = getGitLastUpdatedTimeStamp($page._filePath)
        const $lang = $page._computed.$lang
        if (timestamp) {
            const lastUpdated = typeof transformer === 'function'
            ? transformer(timestamp, $lang)
            : defaultTransformer(timestamp, $lang, dateOptions)
            $page.lastUpdated = lastUpdated
        }
    }
})

function defaultTransformer (timestamp, lang, dateOptions) {
    return new Date(timestamp).toLocaleString(lang, dateOptions)
}

function getGitLastUpdatedTimeStamp (filePath) {
    let lastUpdated
    try {
        const gitLastModifiedAt = spawn.sync(
            'git',
            ['log', '-1', '--format=%at', path.basename(filePath)],
            {
                cwd: path.dirname(filePath),
            }
        );

        console.log(gitLastModifiedAt)
        console.log(gitLastModifiedAt.stdout)
        console.log(gitLastModifiedAt.stdout.toString())
            
        lastUpdated = parseInt(gitLastModifiedAt.stdout.toString(), 10) * 1000
    } catch (e) {
        console.error('[vuepress-plugin-last-updated] ERROR:', e, filePath);
    }

    return lastUpdated
}