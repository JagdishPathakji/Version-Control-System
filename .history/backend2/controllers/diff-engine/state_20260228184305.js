class AppState {

    constructor(mode, files) {
        this.mode = mode
        this.file = files || []
        this.screen = "FILE_LIST"
        this.selectedIndex = 0
        this.activeTab = 0 
    }
}
