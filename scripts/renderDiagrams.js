const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

function cliExec(command, success = undefined) {
    exec(command, {}, (error, stdout, stderr) => {
        if (error) {
            console.error(`Command failed:`, error);
            console.error("Exit code:", error.code);
            console.error("stderr:", stderr);
            throw error;
        } else {
            if (stderr) {
                console.warn(`Command wrote to stderr:`, stderr);
            }
            if (success) {
                console.log(success);
            }
        }
    });
}

function renderDiagram(inputFolder, file, outputFolder, cliBuilder, variant = "") {
    const baseName = file.substring(file.lastIndexOf(path.sep) + 1, file.lastIndexOf("."));
    const inputFilePath = path.join(inputFolder, file);
    const outputFileName = baseName + (variant ? "-" + variant : "") + ".svg";
    const outputFilePath = path.join(outputFolder, outputFileName);

    const command = cliBuilder(inputFilePath, outputFilePath);
    cliExec(command, `Rendered ${file} to ${outputFileName}`);
}

function renderHylimoDiagram(inputFolder, file, outputFolder, variant = "", dark = false) {
    renderDiagram(
        inputFolder,
        file,
        outputFolder,
        (inputFilePath, outputFilePath) =>
            `npx @hylimo/cli -f ${inputFilePath} -o ${outputFilePath} ${dark ? "--dark" : ""}`,
        variant
    );
}

function renderMermaidDiagram(inputFolder, file, outputFolder, variant = "", dark = false) {
    renderDiagram(
        inputFolder,
        file,
        outputFolder,
        (inputFilePath, outputFilePath) =>
            `mmdc -i ${inputFilePath} -o ${outputFilePath} ${dark ? "-t dark -b #1b1b1d" : ""}`,
        variant
    );
}

function renderBpmnDiagram(inputFolder, file, outputFolder, variant = "") {
    renderDiagram(
        inputFolder,
        file,
        outputFolder,
        (inputFilePath, outputFilePath) => `bpmn-to-image ${inputFilePath}${path.delimiter}${outputFilePath}`,
        variant
    );
}

function convertFiles(inputFolder, outputFolder) {
    fs.readdir(inputFolder, { recursive: true }, (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            return;
        }

        files.forEach((file) => {
            if (fs.statSync(path.join(inputFolder, file)).isDirectory()) {
                // file is a directory, no action needed
            } else if (file.endsWith(".hyl")) {
                renderHylimoDiagram(inputFolder, file, outputFolder, "light");
                renderHylimoDiagram(inputFolder, file, outputFolder, "dark", true);
            } else if (file.endsWith(".mmd")) {
                renderMermaidDiagram(inputFolder, file, outputFolder, "light");
                renderMermaidDiagram(inputFolder, file, outputFolder, "dark", true);
            } else if (file.endsWith(".bpmn")) {
                renderBpmnDiagram(inputFolder, file, outputFolder, "light");
                renderBpmnDiagram(inputFolder, file, outputFolder, "dark");
            } else {
                console.warn(`Unknown file type: ${file}`);
            }
        });
    });
}

const args = process.argv.slice(2);

for (let i = 0; i + 1 < args.length; i += 2) {
    console.log(`Converting ${args[i]} to ${args[i + 1]}`);
    convertFiles(args[i], args[i + 1]);
}
