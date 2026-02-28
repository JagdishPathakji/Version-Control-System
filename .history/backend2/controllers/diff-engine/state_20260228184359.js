class AppState {

    constructor(mode, files) {
        this.mode = mode
        this.file = files || []
        this.screen = "FILE_LIST"
        this.selectedIndex = 0
        this.activeTab = 0 
    }

    selectFile(index) {
        this.selectedIndex = index
    }

    switchTab(tabIndex) {
        this.activeTab = tabIndex
    }

    goToFileView() {
        this.scree = "FILE_VIEW"
    }

    goToListView() {
        
    }
}
