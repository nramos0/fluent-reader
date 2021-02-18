/* eslint-disable import/no-commonjs */
const fs = require('fs');
const replace = require('replace');

const createComponent = (componentType, componentName) => {
    componentType = componentType.toLowerCase();
    const templateDirectory = './src/templates/' + componentType + '/';
    const targetDirectory =
        './src/' + componentType + 's/' + componentName + '/';

    if (!handleTargetDirectory(targetDirectory)) return;
    if (!readAndCopyFiles(componentName, templateDirectory, targetDirectory))
        return;
    logSuccess(componentType, componentName, targetDirectory);
};

const handleTargetDirectory = (targetDirectory) => {
    if (fs.existsSync(targetDirectory)) {
        console.log(
            'Error: Directory ' +
                targetDirectory +
                ' already exists. Check the component name.'
        );
        return false;
    }

    fs.mkdirSync(targetDirectory, { recursive: true });
    return true;
};

const readAndCopyFiles = (
    componentName,
    templateDirectory,
    targetDirectory
) => {
    const files = fs.readdirSync(templateDirectory);

    files.forEach((templateFile) => {
        let fileExtension = templateFile.substr(templateFile.lastIndexOf('.'));
        if (isTestFile(templateFile)) {
            fileExtension = '.test' + fileExtension;
        }
        const targetPath = targetDirectory + componentName + fileExtension;

        const templatePath = templateDirectory + templateFile;

        copyAndRename(templatePath, targetPath, componentName);
    });
    return true;
};

const isTestFile = (file) => {
    return file.includes('.test.');
};

const copyAndRename = (sourcePath, targetPath, componentName) => {
    fs.copyFileSync(sourcePath, targetPath);
    replace({
        regex: 'TemplateName',
        replacement: componentName,
        paths: [targetPath],
        silent: true,
    });
};

const logSuccess = (componentType, componentName, targetDirectory) => {
    console.log(
        'Component "' +
            componentName +
            '" of type "' +
            componentType +
            '" was created successfully!\nPath: ' +
            targetDirectory
    );
};

(function () {
    const componentType = process.argv[2];
    const componentName = process.argv[3];

    if (!componentType) {
        console.log('Please specify a component type');
        return;
    }
    if (!componentName) {
        console.log('Please specify a component name');
        return;
    }
    createComponent(componentType, componentName);
})();
