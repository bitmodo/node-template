import { src, dest, watch, parallel }       from 'gulp';
import gulpIf                               from 'gulp-if';
import { init as smInit, write as smWrite } from 'gulp-sourcemaps';

import minimist from 'minimist';

import { createProject } from 'gulp-typescript';
import mocha             from 'gulp-mocha';

// Constants

const args = minimist(process.argv.slice(2), {
    string:  [
        'env'
    ],
    boolean: [
        'production',
        'development'
    ],
    alias:   {
        production:  ['prod', 'p'],
        development: ['dev', 'd']
    },
    default: {
        env:         (process.env.NODE_ENV || 'production').trim().toLowerCase(),
        production:  false,
        development: false
    },
});

// const production  = (args.env === 'production' || args.env === 'prod' || args.production) && !args.development;
const development = (args.env === 'development' || args.env === 'dev' || args.development) && !args.production;

const tsProject = createProject('tsconfig.json');

// Regular tasks

function ts() {
    return tsProject.src()
                    .pipe(gulpIf(development, smInit({ loadMaps: true })))
                    .pipe(tsProject())
                    .pipe(gulpIf(development, smWrite()))
                    .pipe(dest('dist'));
}

function testTs() {
    return src('test/**/*')
        .pipe(mocha());
}

// Watch functions

function watchTs() {
    return watch('lib/**/*', ts);
}

// Task exports

exports.ts    = ts;
exports.build = parallel(exports.ts);

exports.testTs = testTs;
exports.test   = parallel(exports.testTs);

exports.watchTs = watchTs;
exports.watch   = parallel(exports.watchTs);

exports.default = exports.build;
