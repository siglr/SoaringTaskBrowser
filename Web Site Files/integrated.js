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
    // Buttons on the map
    //
    
    // Function to zoom to the selected task
    zoomToTask() {
        let itb = this;
        itb.tbm.zoomToTask();
    }

    // Full world button function
    resetToFullWorld() {
        let itb = this;
        itb.tbm.resetToFullWorld();
    }

    //
    // Commands received by the task browser app
    //

    // Function to select a task on the map
    selectTask(entrySeqID, forceBoundsUpdate = false) {
        let itb = this;
        itb.tbm.selectTask(entrySeqID, forceBoundsUpdate);
    };

    // Function to filter tasks based on a list of EntrySeqIDs
    filterTasks(entrySeqIDs) {
        let itb = this;
        // Save the list of tasks
        itb.tbm.filterTasks(entrySeqIDs);
    };

    // Function to clear all filters and show all tasks
    clearFilter() {
        let itb = this;
        itb.tbm.clearFilter();
    };

} // end class IntegratedTB
