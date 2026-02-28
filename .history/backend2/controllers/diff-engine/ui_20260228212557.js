const blessed = require("blessed");
const aiAnalyzer = require("./aiAnalyzer");

function startUI(state) {
    const screen = blessed.screen({
        smartCSR: true,
        title: "JVCS Diff Viewer"
    });

    // ---------------------------------------
    // UI COMPONENTS
    // ---------------------------------------
    const header = blessed.box({
        top: 0, height: 1, width: "100%",
        content: ` JVCS DIFF VIEW (${state.mode}) | ↑↓ Navigate | Enter Open | Esc Back | Tab Switch | Q Quit `,
        style: { fg: "white", bg: "blue", bold: true, underline: true },
        tags: true
    });
    screen.append(header);

    const fileList = blessed.list({
        top: 1, left: 0, width: "100%", height: "100%-1",
        keys: true, vi: true, border: "line",
        label: " Changed Files ",
        style: { selected: { bg: "blue" }, item: { fg: "white" } },
        tags: true
    });
    screen.append(fileList);

    const panelOptions = {
        top: 1, height: "100%-1", border: "line",
        scrollable: true, alwaysScroll: true, keys: true, vi: true,
        scrollbar: { ch: "│", track: { bg: "black" }, style: { bg: "yellow" } },
        padding: { left: 1, right: 1 }, tags: true
    };

    const leftBox = blessed.box({ ...panelOptions, left: 0, width: "33%", label: " LEFT " });
    const rightBox = blessed.box({ ...panelOptions, left: "33%", width: "34%", label: " RIGHT " });
    const aiBox = blessed.box({ ...panelOptions, left: "67%", width: "33%", label: " AI ANALYSIS " });

    // ---------------------------------------
    // HELPERS
    // ---------------------------------------
    function stripMarkdown(text) {
        return text
            .replace(/#{1,6}\s/g, "")            // Remove headers
            .replace(/\*\*(.*?)\*\*/g, "$1")      // Bold to text
            .replace(/\*(.*?)\*/g, "$1")          // Italics to text
            .replace(/`(.*?)`/g, "$1")            // Code ticks to text
            .replace(/\[(.*?)\]\(.*?\)/g, "$1")   // Links to text
            .replace(/^>\s/gm, "")                // Blockquotes
            .replace(/^- /gm, "• ");              // List markers to bullets
    }

    function colorDiffContent(content, type) {
        if (!content) return "";
        return content.split("\n").map(line => {
            if(type === "added") return `{green-fg}+ ${line}{/green-fg}`;
            if(type === "removed") return `{red-fg}- ${line}{/red-fg}`;
            return `  ${line}`;
        }).join("\n");
    }

    // ---------------------------------------
    // RENDER LOGIC
    // ---------------------------------------
    async function renderFileView() {
        const file = state.getCurrentFile();
        if (!file) return;

        leftBox.setContent(colorDiffContent(file.leftContent, "removed"));
        rightBox.setContent(colorDiffContent(file.rightContent, "added"));
        aiBox.setContent("AI Analysis: Loading...");

        screen.append(leftBox);
        screen.append(rightBox);
        screen.append(aiBox);
        
        updateActiveTabHighlight();
        screen.render();

        try {
            const aiSummary = await aiAnalyzer({
                filePath: file.path,
                leftContent: file.leftContent,
                rightContent: file.rightContent,
                mode: state.mode
            });

            // Convert to clean text for terminal
            aiBox.setContent(stripMarkdown(aiSummary));
            screen.render();
        }
        catch(error) {
            aiBox.setContent(`{red-fg}AI Analysis failed: ${error.message || error}{/red-fg}`);
            screen.render();
        }
    }

    function updateActiveTabHighlight() {
        leftBox.style.border.fg = state.activeTab === 0 ? "yellow" : "grey";
        rightBox.style.border.fg = state.activeTab === 1 ? "yellow" : "grey";
        aiBox.style.border.fg = state.activeTab === 2 ? "yellow" : "grey";
        if(state.activeTab === 0) leftBox.focus();
        else if(state.activeTab === 1) rightBox.focus();
        else aiBox.focus();
        screen.render();
    }

    // ---------------------------------------
    // INPUT HANDLING
    // ---------------------------------------
    screen.key(["q", "C-c"], () => process.exit(0));
    fileList.key(["up"], () => { if(state.selectedIndex > 0) { state.selectFile(state.selectedIndex - 1); renderFileList(); }});
    fileList.key(["down"], () => { if(state.selectedIndex < state.files.length - 1) { state.selectFile(state.selectedIndex + 1); renderFileList(); }});
    fileList.key(["enter"], async () => { state.goToFileView(); fileList.detach(); await renderFileView(); });
    screen.key(["escape"], () => { if(state.screen === "FILE_VIEW") { state.goToListView(); leftBox.detach(); rightBox.detach(); aiBox.detach(); screen.append(fileList); renderFileList(); }});
    screen.key(["tab"], () => { if(state.screen === "FILE_VIEW") { state.switchTab((state.activeTab + 1) % 3); updateActiveTabHighlight(); }});

    function renderFileList() {
        fileList.setItems(state.files.map(f => `${f.status === "added" ? "{green-fg}" : f.status === "deleted" ? "{red-fg}" : "{yellow-fg}"}${f.status.toUpperCase()}{/} ${f.path}`));
        fileList.select(state.selectedIndex);
        fileList.focus();
        screen.render();
    }

    renderFileList();
}

module.exports = startUI;