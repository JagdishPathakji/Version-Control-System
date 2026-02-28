const blessed = require("blessed")

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
            fg: "black",
            bg: "cyan"
        }
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
            selected: {
                bg: "blue"
            }
        }
    })

    screen.append(fileList)

    function renderFileList() {
        const items = state.files.map((file, index) => {
            return `${file.status.toUpperCase()}  ${file.path}`
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
        vi: true
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
        vi: true
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
        vi: true
    })

    function renderFileView() {

        const file = state.getCurrentFile()
        if (!file) return

        leftBox.setContent(file.leftContent || "")
        rightBox.setContent(file.rightContent || "")

        aiBox.setContent(`
Summary:
Changes detected in file.

Status: ${file.status}

Lines Added: ${file.stats.added}
Lines Removed: ${file.stats.removed}

(Real AI analysis will appear here later)
        `)

        screen.append(leftBox)
        screen.append(rightBox)
        screen.append(aiBox)

        updateActiveTabHighlight()

        screen.render()
    }

    function destroyFileView() {
        leftBox.detach()
        rightBox.detach()
        aiBox.detach()
        screen.render()
    }

    function updateActiveTabHighlight() {

        leftBox.style.border.fg = "white"
        rightBox.style.border.fg = "white"
        aiBox.style.border.fg = "white"

        if (state.activeTab === 0) {
            leftBox.style.border.fg = "yellow"
            leftBox.focus()
        }
        else if (state.activeTab === 1) {
            rightBox.style.border.fg = "yellow"
            rightBox.focus()
        }
        else {
            aiBox.style.border.fg = "yellow"
            aiBox.focus()
        }

        screen.render()
    }

    // ---------------------------------------
    // KEYBOARD CONTROLS
    // ---------------------------------------

    screen.key(["q", "C-c"], () => {
        return process.exit(0)
    })

    // Navigate list
    fileList.key(["up"], () => {
        if (state.selectedIndex > 0) {
            state.selectFile(state.selectedIndex - 1)
            renderFileList()
        }
    })

    fileList.key(["down"], () => {
        if (state.selectedIndex < state.files.length - 1) {
            state.selectFile(state.selectedIndex + 1)
            renderFileList()
        }
    })

    // Enter → Open file view
    fileList.key(["enter"], () => {
        state.goToFileView()
        fileList.detach()
        renderFileView()
    })

    // ESC → Back to list
    screen.key(["escape"], () => {
        if (state.screen === "FILE_VIEW") {
            state.goToListView()
            destroyFileView()
            screen.append(fileList)
            renderFileList()
        }
    })

    // TAB → switch active panel
    screen.key(["tab"], () => {
        if (state.screen === "FILE_VIEW") {
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