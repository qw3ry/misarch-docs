const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

function renderDiagram(inputFolder, file, outputFolder, cliBuilder, variant = "") {
    const baseName = file.substring(0, file.lastIndexOf("."));
    const inputFilePath = path.join(inputFolder, file);
    const outputFileName = baseName + (variant ? "-" + variant : "") + ".svg";
    const outputFilePath = path.join(outputFolder, outputFileName);

    const command = cliBuilder(inputFilePath, outputFilePath);
    exec(command, {}, (error, stdout, stderr) => {
        if (error) {
            console.error("Command failed:", error);
            console.error("Exit code:", error.code);
            console.error("stderr:", stderr);
            throw error;
        } else {
            if (stderr) {
                console.warn("Command wrote to stderr:", stderr);
            }
            console.log(`Rendered ${file} to ${outputFileName}`);
        }
    });
}

function renderHylimoDiagram(inputFolder, file, outputFolder, variant = "", dark = false) {
    renderDiagram(
        inputFolder,
        file,
        outputFolder,
        (inputFilePath, outputFilePath) => `npx @hylimo/cli -f ${inputFilePath} -o ${outputFilePath} ${dark? "--dark" : ""}`,
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

function convertFiles(inputFolder, outputFolder) {
    fs.readdir(inputFolder, (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            return;
        }

        files.forEach((file) => {
            if (file.endsWith(".hyl")) {
                renderHylimoDiagram(inputFolder, file, outputFolder, "light");
                renderHylimoDiagram(inputFolder, file, outputFolder, "dark", true);
            } else if (file.endsWith(".mmd")) {
                renderMermaidDiagram(inputFolder, file, outputFolder, "light");
                renderMermaidDiagram(inputFolder, file, outputFolder, "dark", true);
            }
        });
    });
}

convertFiles("diagrams", "static/renderedDiagrams");
convertFiles("image-sources/diagrams/user-journeys", "static/renderedDiagrams");
