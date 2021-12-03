const { injectManifest } = require('workbox-build')

    let workboxConfig = {
        globDirectory: 'build',
        globPatterns: [
            '*.js',
            '*.css',
            'favicon.ico',
            'index.html',
        ],
        swSrc: 'src/service-worker.js',
        swDest: 'build/service-worker.js',
        // Custom size limit
        maximumFileSizeToCacheInBytes: 9 * 1024 * 1024
    }

    injectManifest(workboxConfig)
    .then(({
        count,
        size
    }) => {
        console.log(`Generated ${workboxConfig.swDest}, which will precache ${count} files, totaling ${size} bytes.`)
    })