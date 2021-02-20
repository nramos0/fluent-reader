const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const deleteFile = util.promisify(fs.unlink);

const getBaseConfig = async () => {
    const baseConfig = await readFile('./tsconfig.json').then((data) => {
        return JSON.parse(data);
    });

    baseConfig.compilerOptions.skipLibCheck = true;

    return baseConfig;
};

const getIncludeFiles = () => {
    const includeFiles = [];

    const argCount = process.argv.length;
    for (let i = 2; i < argCount; ++i) {
        includeFiles.push(process.argv[i]);
    }

    return includeFiles;
};

const getConfig = async () => {
    const baseConfig = await getBaseConfig();

    const shouldCompileAllFiles = process.argv[2] === '--allFiles';
    console.log(
        'Compiling all files: ' + (shouldCompileAllFiles ? 'yes' : 'no')
    );

    if (shouldCompileAllFiles) {
        return JSON.stringify(baseConfig);
    }

    const includeFiles = getIncludeFiles();

    if (includeFiles.length === 0) return;

    const newConfig = {
        ...baseConfig,
        include: [...includeFiles, ...baseConfig.compilerOptions.types],
    };

    delete newConfig.compilerOptions.types;

    return JSON.stringify(newConfig);
};

(async () => {
    const tempTsConfig = await getConfig();
    const fileName = 'tempTsConfig.json';

    await writeFile(fileName, tempTsConfig);

    // note: showConfig === true will only show the typescript config, it will not attempt compilation
    const showConfig = false;

    try {
        const { stdout } = await exec(
            `yarn tsc --noEmit --jsx react-jsx ${
                showConfig ? '--showConfig ' : ''
            }--project ${fileName}`
        );
        console.log(stdout);
    } catch (err) {
        console.log(err.stdout);
        process.exitCode = 1;
    }

    await deleteFile(fileName);
})();
