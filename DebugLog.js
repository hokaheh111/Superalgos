﻿exports.newDebugLog = function newDebugLog() {

    const ROOT_DIR = './';
    const MODULE_NAME = "Debug Log";
    const fileSystem = require('fs');

    const currentDate = new Date();
    const dateString = currentDate.getUTCFullYear() + '-' + pad(currentDate.getUTCMonth() + 1, 2) + '-' + pad(currentDate.getUTCDate(), 2) + '-' + pad(currentDate.getUTCHours(), 2) + '-' + pad(currentDate.getUTCMinutes(), 2);
    const randomId = parseInt(Math.random() * 1000000); 

    let executionDatetime = global.EXECUTION_DATETIME.toISOString();  
    let executionPath = global.EXECUTION_DATETIME.getUTCFullYear() + '-' + pad(global.EXECUTION_DATETIME.getUTCMonth() + 1, 2) + '-' + pad(global.EXECUTION_DATETIME.getUTCDate(), 2) + 'T' + pad(global.EXECUTION_DATETIME.getUTCHours(), 2) + '-' + pad(global.EXECUTION_DATETIME.getUTCMinutes(), 2) + '-' + pad(global.EXECUTION_DATETIME.getUTCSeconds(), 2);

    let fileNumber = 1;
    let messageId = 0;
    let firstCall = true;
    let folderPath;
    let loopCounter;
    let loopIncremented = false;

    let thisObject = {
        bot: undefined,
        fileName: undefined,
        forceLoopSplit: false,          // When set to 'true' this will force that the logs of the current module are split in many different Loop folders.
        write: write,
        initialize: initialize
    };

    let blobContent = "[";

    let disableCloudLogging;

    return thisObject;

    function initialize(pDisableCloudLogging) {

        disableCloudLogging = pDisableCloudLogging

        if (disableCloudLogging !== true) {
            thisObject.bot.eventHandler.listenToEvent("Loop Finished", onLoopFinished);
        }
    }

    function onLoopFinished(event) {

        try {

            const BLOB_STORAGE = require(ROOT_DIR + 'BlobStorage');
            let cloudStorage = BLOB_STORAGE.newBlobStorage(thisObject.bot);

            cloudStorage.initialize(thisObject.bot.devTeam, onInizialized, true);

            function onInizialized(err) {

                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                    let filePath = thisObject.bot.filePathRoot + "/Logs/" + thisObject.bot.process + "/" + executionDatetime;

                    if (thisObject.bot.debug.year !== undefined) {

                        filePath = filePath + "/" + thisObject.bot.debug.year + "/" + thisObject.bot.debug.month;
                    }

                    if (loopCounter === undefined) { loopCounter = 0 };

                    filePath = filePath + "/Loop." + pad(loopCounter, 5);

                    cloudStorage.createTextFile(filePath, thisObject.fileName + ".json", blobContent + '\n' + "]", onFileCreated);

                    function onFileCreated(err) {

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            console.log("[ERROR] onLoopFinished -> onInizialized -> onFileCreated -> err = " + err.message);
                            return;
                        }
                    }

                } else {
                    console.log("[ERROR] onLoopFinished -> onInizialized -> err = " + err.message);
                }
            }

        } catch (err) {
            console.log("[ERROR] onLoopFinished -> err = " + err.message);
        }
    }

    function createFolders() {

        try {

            folderPath = '../Logs';

            createFolderSync(folderPath);

            folderPath = '../Logs/' + executionPath;

            createFolderSync(folderPath);

            folderPath = '../Logs/' + executionPath + "/" + thisObject.bot.devTeam;

            createFolderSync(folderPath);

            folderPath = '../Logs/' + executionPath + "/" + thisObject.bot.devTeam + "/" + thisObject.bot.type;

            createFolderSync(folderPath);

            folderPath = '../Logs/' + executionPath + "/" + thisObject.bot.devTeam + "/" + thisObject.bot.type + "/" + thisObject.bot.codeName + "." + thisObject.bot.version.major + "." + thisObject.bot.version.minor;

            createFolderSync(folderPath);

            folderPath = '../Logs/' + executionPath + "/" + thisObject.bot.devTeam + "/" + thisObject.bot.type + "/" + thisObject.bot.codeName + "." + thisObject.bot.version.major + "." + thisObject.bot.version.minor + "/" + thisObject.bot.process;

            createFolderSync(folderPath);

            firstCall = false;

        }
        catch (err) {
            console.log("Error trying to create the folders needed.  Error: " + err.message);
        }
    }

    function createLoopFolder() {

        try {

            if (thisObject.bot.debug.year !== undefined) {

                /* When there are YEARS and MONTHS involved */

                folderPath = '../Logs/' + executionPath + "/" + thisObject.bot.devTeam + "/" + thisObject.bot.type + "/" + thisObject.bot.codeName + "." + thisObject.bot.version.major + "." + thisObject.bot.version.minor + "/" + thisObject.bot.process + "/" + thisObject.bot.debug.year;

                createFolderSync(folderPath);

                folderPath = '../Logs/' + executionPath + "/" + thisObject.bot.devTeam + "/" + thisObject.bot.type + "/" + thisObject.bot.codeName + "." + thisObject.bot.version.major + "." + thisObject.bot.version.minor + "/" + thisObject.bot.process + "/" + thisObject.bot.debug.year + "/" + thisObject.bot.debug.month;

                createFolderSync(folderPath);

                /* Loop folder creation and mantainance. */

                /* We create the new one. */

                folderPath = '../Logs/' + executionPath + "/" + thisObject.bot.devTeam + "/" + thisObject.bot.type + "/" + thisObject.bot.codeName + "." + thisObject.bot.version.major + "." + thisObject.bot.version.minor + "/" + thisObject.bot.process + "/" + thisObject.bot.debug.year + "/" + thisObject.bot.debug.month + "/Loop." + loopCounter;

                createFolderSync(folderPath);

                /* We also remove old folders according to the configuration value of global.PLATFORM_CONFIG.maxLogLoops. */

                let folderToRemove = '../Logs/' + executionPath + "/" + thisObject.bot.devTeam + "/" + thisObject.bot.type + "/" + thisObject.bot.codeName + "." + thisObject.bot.version.major + "." + thisObject.bot.version.minor + "/" + thisObject.bot.process + "/" + thisObject.bot.debug.year + "/" + thisObject.bot.debug.month + "/Loop." + (loopCounter - global.PLATFORM_CONFIG.maxLogLoops).toString();

                deleteLoopFolder(folderToRemove);


            } else {

                /* When there are no YEARS or MONTHS involved */

                /* We create the new one. */

                folderPath = '../Logs/' + executionPath + "/" + thisObject.bot.devTeam + "/" + thisObject.bot.type + "/" + thisObject.bot.codeName + "." + thisObject.bot.version.major + "." + thisObject.bot.version.minor + "/" + thisObject.bot.process + "/Loop." + loopCounter;

                createFolderSync(folderPath);

                /* We also remove old folders according to the configuration value of global.PLATFORM_CONFIG.maxLogLoops. */

                let folderToRemove = '../Logs/' + executionPath + "/" + thisObject.bot.devTeam + "/" + thisObject.bot.type + "/" + thisObject.bot.codeName + "." + thisObject.bot.version.major + "." + thisObject.bot.version.minor + "/" + thisObject.bot.process + "/Loop." + (loopCounter - global.PLATFORM_CONFIG.maxLogLoops).toString();

                deleteLoopFolder(folderToRemove);
            }
        }
        catch (err) {
            console.log("Error trying to create the loop folder needed or deleting old ones.  Error: " + err.message);
        }
    }

    function write(Message) {

        console.log("AACloud" + spacePad(thisObject.fileName, 50) + " : " + Message);

        if (thisObject.bot === undefined) { return;}

        if (firstCall === true && global.CURRENT_EXECUTION_AT === "Cloud") { createFolders(); }

        if (thisObject.bot.loopCounter !== loopCounter) {

            if (thisObject.forceLoopSplit === false) {

                if (loopIncremented === false) {

                    loopIncremented = true;

                    loopCounter = thisObject.bot.loopCounter;
                    createLoopFolder();
                    blobContent = "[";
                }
            } else {

                loopIncremented = true;

                loopCounter = thisObject.bot.loopCounter;
                createLoopFolder();

            }
        }

        let filePath = getCurrentLogFile(folderPath + "/" + dateString + "---" + randomId + "---", thisObject.fileName);

        let newDate = new Date();
        newDate = newDate.toISOString();

        messageId++;

        try {

            let line = {
                date: newDate,
                sec: messageId,
                data: Message
            };

            let fileLine = '\r\n' + JSON.stringify(line);

            fileSystem.appendFileSync(filePath, fileLine);

            if (blobContent === "[") {

                blobContent = blobContent + fileLine;

            } else {

                blobContent = blobContent + "," + fileLine;
            }

        }
        catch (err) {
            //console.log("Error trying to log info into a file.");
            //console.log("File: " + filePath );
            //console.log("Error: " + err.message);
        }
    }

    function createFolderSync(name) {
        try {
            fileSystem.mkdirSync(  name)
        } catch (err) {
            if (err.code !== 'EEXIST') throw err
        }
    }

    function getCurrentLogFile(relativePath, fileName) {

        let filePath;
        let stats;
        let i;

        try {
            for (i = 1; i < 1000000; i++) {

                filePath =  relativePath + i + "." + fileName + '.log';
                stats = fileSystem.statSync(filePath);
            }
        }
        catch (err) {

            if (i > 1) {

                filePath =  relativePath + (i - 1) + "." + fileName + '.log';

                stats = fileSystem.statSync(filePath);
                const fileSizeInBytes = stats.size;

                if (fileSizeInBytes > 10240000) {

                    filePath =  relativePath + i + "." + fileName + '.log';
                }

                return filePath;

            } else {

                return filePath;

            }

        }

    }

    function pad(str, max) {
        str = str.toString();
        return str.length < max ? pad("0" + str, max) : str;
    }

    function spacePad(str, max) {
        str = str.toString();
        return str.length < max ? spacePad(" " + str, max) : str;
    }

    function deleteLoopFolder(pFolderPath) {

        let fs = require('fs');
        let errosFound = false;

        try {

            let fileCount;
            let filesChecked = 0;

            fs.readdir(pFolderPath, onfileCount);

            function onfileCount(err, files) {

                if (err) { return; }

                try {
                    fileCount = files.length;

                    fs.readdirSync(pFolderPath).forEach(fileName => {

                        fs.readFile(pFolderPath + "/" + fileName, onFileRead);

                        function onFileRead(err, file) {

                            try {

                                filesChecked++;

                                if (file.indexOf("[ERROR]") > 0) {

                                    errosFound = true;

                                }

                                if (filesChecked === fileCount) {

                                    if (errosFound === false) {

                                        let rimraf = require('rimraf');
                                        rimraf.sync(pFolderPath);

                                    }
                                }
                            }
                            catch (err) {
                                // We ignore the error;
                                return;
                            }
                        }
                    })
                }
                catch (err) {
                    // We ignore the error;
                    return;
                }  
            }
        }
        catch (err) {
            // We ignore the error;
            return;
        } 
    }
};

