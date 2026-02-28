const blessed = require("blessed")
const aiAnalyzer = require("./aiAnalyzer")
const marked = require("marked");
const { TerminalRendere r = require("marked-terminal");

marked.setOptions({
    renderer: new TerminalRenderer()
});

function startUI(state) {
    const screen = blessed.screen({
        smartCSR: true,
        title: "JVCS Diff Viewer"
    })

    // ---------------------------------------
    // HEADER
    // ---------------------------------------
    const header = blessed.box({
        top: 0,
        height: 1,
        width: "100%",
        content: ` JVCS DIFF VIEW (${state.mode}) | ↑↓ Navigate | Enter Open | Esc Back | Tab Switch | Q Quit `,
        style: {
            fg: "white",
            bg: "blue",
            bold: true,
            underline: true
        },
        tags: true
    })
    screen.append(header)

    // ---------------------------------------
    // FILE LIST VIEW
    // ---------------------------------------
    const fileList = blessed.list({
        top: 1,
        left: 0,
        width: "100%",
        height: "100%-1",
        keys: true,
        vi: true,
        border: "line",
        label: " Changed Files ",
        style: {
            selected: { bg: "blue" },
            item: { fg: "white" }
        },
        tags: true
    })
    screen.append(fileList)

    function renderFileList() {
        const items = state.files.map(file => {
            let statusColored
            switch(file.status) {
                case "added": statusColored = `{green-fg}${file.status.toUpperCase()}{/green-fg}`; break
                case "deleted": statusColored = `{red-fg}${file.status.toUpperCase()}{/red-fg}`; break
                case "modified": statusColored = `{yellow-fg}${file.status.toUpperCase()}{/yellow-fg}`; break
                default: statusColored = file.status.toUpperCase()
            }
            return `${statusColored}  ${file.path}`
        })
        fileList.setItems(items)
        fileList.select(state.selectedIndex)
        fileList.focus()
        screen.render()
    }

    // ---------------------------------------
    // FILE VIEW (3 PANELS)
    // ---------------------------------------
    const leftBox = blessed.box({
        top: 1,
        left: 0,
        width: "33%",
        height: "100%-1",
        border: "line",
        label: " LEFT ",
        scrollable: true,
        alwaysScroll: true,
        keys: true,
        vi: true,
        scrollbar: { ch: "│", track: { bg: "black" }, style: { bg: "yellow" } },
        padding: { left: 1, right: 1 },
        tags: true
    })

    const rightBox = blessed.box({
        top: 1,
        left: "33%",
        width: "34%",
        height: "100%-1",
        border: "line",
        label: " RIGHT ",
        scrollable: true,
        alwaysScroll: true,
        keys: true,
        vi: true,
        scrollbar: { ch: "│", track: { bg: "black" }, style: { bg: "yellow" } },
        padding: { left: 1, right: 1 },
        tags: true
    })

    const aiBox = blessed.box({
        top: 1,
        left: "67%",
        width: "33%",
        height: "100%-1",
        border: "line",
        label: " AI ANALYSIS ",
        scrollable: true,
        alwaysScroll: true,
        keys: true,
        vi: true,
        scrollbar: { ch: "│", track: { bg: "black" }, style: { bg: "yellow" } },
        padding: { left: 1, right: 1 },
        tags: true
    })

    function colorDiffContent(content, type) {
        return content.split("\n").map(line => {
            if(type === "added") return `{green-fg}+ ${line}{/green-fg}`
            if(type === "removed") return `{red-fg}- ${line}{/red-fg}`
            return `  ${line}`
        }).join("\n")
    }

    async function renderFileView() {
        const file = state.getCurrentFile()
        if (!file) return

        leftBox.setContent(colorDiffContent(file.leftContent, "removed"))
        rightBox.setContent(colorDiffContent(file.rightContent, "added"))

        aiBox.setContent("AI Analysis: Loading...");
        screen.append(leftBox)
        screen.append(rightBox)
        screen.append(aiBox)
        updateActiveTabHighlight();
        screen.render();

        try {
            const aiSummary = await aiAnalyzer({
                filePath: file.path,
                leftContent: file.leftContent,
                rightContent: file.rightContent,
                mode: state.mode
            })

            const parsed = marked(aiSummary); // Markdown → terminal-friendly text
            aiBox.setContent(parsed);
            screen.render()
        }
        catch(error) {
            aiBox.setContent(`AI Analysis failed: ${error.message || error}`);
            screen.render()
        }
    }

    function destroyFileView() {
        leftBox.detach()
        rightBox.detach()
        aiBox.detach()
        screen.render()
    }

    function updateActiveTabHighlight() {
        leftBox.style.border.fg = state.activeTab === 0 ? "yellow" : "grey"
        rightBox.style.border.fg = state.activeTab === 1 ? "yellow" : "grey"
        aiBox.style.border.fg = state.activeTab === 2 ? "yellow" : "grey"

        if(state.activeTab === 0) leftBox.focus()
        else if(state.activeTab === 1) rightBox.focus()
        else aiBox.focus()

        screen.render()
    }

    // ---------------------------------------
    // KEYBOARD CONTROLS
    // ---------------------------------------
    screen.key(["q", "C-c"], () => process.exit(0))

    // Navigate list
    fileList.key(["up"], () => {
        if(state.selectedIndex > 0) {
            state.selectFile(state.selectedIndex - 1)
            renderFileList()
        }
    })
    fileList.key(["down"], () => {
        if(state.selectedIndex < state.files.length - 1) {
            state.selectFile(state.selectedIndex + 1)
            renderFileList()
        }
    })

    // Enter → Open file view
    fileList.key(["enter"], async () => {
        state.goToFileView()
        fileList.detach()
        await renderFileView()
    })

    // ESC → Back to list
    screen.key(["escape"], () => {
        if(state.screen === "FILE_VIEW") {
            state.goToListView()
            destroyFileView()
            screen.append(fileList)
            renderFileList()
        }
    })

    // TAB → switch active panel
    screen.key(["tab"], () => {
        if(state.screen === "FILE_VIEW") {
            state.switchTab((state.activeTab + 1) % 3)
            updateActiveTabHighlight()
        }
    })

    // ---------------------------------------
    // INITIAL RENDER
    // ---------------------------------------
    renderFileList()
}

module.exports = startUI