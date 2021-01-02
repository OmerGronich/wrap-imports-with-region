const
    path = require('path'),
    fs = require('fs'),
    excluded = ['node_modules', '.idea', 'wrap-imports-with-regions'],
    command_line_args = process.argv
        .slice(2) // ignore node and script name go straight to args
        .reduce((acc, curr) => { // create dictionary from argv array
            if (curr.includes('=')) {
                const [key, value] = curr.split("=");
                acc[key] = value;
                return acc;
            }

            acc[curr] = curr;
            return acc;
        }, {}),
    no_emit = command_line_args.noEmit || false,
    start_dir = command_line_args.startFolder || path.dirname(require.main.filename),
    extension = command_line_args.extension || '.ts',
    region_text = command_line_args.regionText || 'imports',
    all_ts_files = [];

const logger = new Proxy({
    log: (...messages) => console.log("\x1b[36m%s\x1b[0m", ...messages),
    info: (...messages) => console.log("\x1b[36m%s\x1b[0m", ...messages),
    warn: (...messages) => console.log("\x1b[33m%s\x1b[0m", ...messages),
    error: (...messages) => console.log("\x1b[31m%s\x1b[0m", ...messages),
    success: (...messages) => console.log("\x1b[32m%s\x1b[0m", ...messages),
    _raw: console.log
}, {
    get: function (target, prop, receiver) {
        if (no_emit) {
            return logger[prop] = function () {
            };

        }
        return target[prop];

    }
});

function fromDir(startPath, filter) {
    const files = fs.readdirSync(startPath);

    for (let i = 0; i < files.length; i++) {
        const
            filename = path.join(startPath, files[i]),
            stat = fs.lstatSync(filename);

        if (excluded.some(ex => filename.includes(ex))) {
            continue;
        }

        if (stat?.isDirectory()) {
            fromDir(filename, filter);
        } else if (filename.endsWith(filter)) {
            logger.info(`[!] found typescript file: ${filename}`);
            all_ts_files.push(filename);
        }

    }
}

fromDir(start_dir, extension);

all_ts_files.forEach(filename => {

    const
        getFileName = (name = filename) => {
            return name.slice(name.lastIndexOf('/') + 1);
        },
        file = fs.readFileSync(filename, "utf8"),
        file_arr = file.split(/\r?\n/),
        last_import_index = file_arr
            .indexOf(file_arr
                .concat()
                .reverse()
                .find(el => /(import .+ from \'.+\')||(import \* as .+ from \'.+\')/.test(el))
            ) + 1;

    logger.warn(`-- attempting to format: ${getFileName()}`);

    if (!file_arr.find(el => el.includes('import'))) {
        logger.error(`There are no imports in ${getFileName()}`);
        return;
    }

    if (
        file_arr.some(el => el.includes('//region')) &&
        file_arr.some(el => el.includes('//endregion'))
    ) {
        logger.success(`The imports in ${getFileName()} are already properly wrapped with regions`);
        return;
    }

    if (file_arr.filter(Boolean).length) {
        const
            imports = file_arr.slice(0, last_import_index),
            rest_of_file = file_arr.slice(last_import_index);

        imports.unshift(`//region ${region_text}`);
        imports.push('//endregion');
        // pushing just one space character so theres a new line after imports
        imports.push(' ');

        let formatted_file = [...imports, ...rest_of_file].join('\n');

        fs.writeFileSync(filename, formatted_file);
        logger.success(`The imports in ${getFileName()} were successfully wrapped with regions`);
    } else {
        logger.error(`${getFileName()} is empty`);
        return;
    }

});
