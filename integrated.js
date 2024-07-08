"use strict"

class IntegratedTB {

    constructor() {
        let itb = this;
        itb.tbm = new TaskBrowserMap(itb);
    }

    init() {
        let itb = this;
        console.log("Integrated.init()");
    }

    //
    // Commands received by the task browser app
    //

    // Function to select a task on the map
    selectTaskFromApp(entrySeqID, forceBoundsUpdate = false) {
        let itb = this;
        itb.tbm.selectTaskFromApp(entrySeqID, forceBoundsUpdate);
    };

    // Function to filter tasks based on a list of EntrySeqIDs
    filterTasksFromApp(entrySeqIDs) {
        let itb = this;
        // Save the list of tasks
        itb.tbm.filterTasksFromApp(entrySeqIDs);
    };

    // Function to clear all filters and show all tasks
    clearFilterFromApp() {
        let itb = this;
        itb.tbm.clearFilterFromApp();
    };

} // end class IntegratedTB
