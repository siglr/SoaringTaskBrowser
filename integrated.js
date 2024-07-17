"use strict"

class IntegratedTB {

    constructor() {
        let tb = this;
        tb.tbm = new TaskBrowserMap(tb);
    }

    init() {
        let tb = this;
        console.log("Integrated.init()");
        tb.loadUserSettings();
    }

    //
    // Commands received by the task browser app
    //

    // Function to select a task on the map
    selectTaskFromApp(entrySeqID, forceZoomToTask = false) {
        let tb = this;
        tb.tbm.selectTaskFromDPHXApp(entrySeqID, forceZoomToTask);
    };

    // Function to filter tasks based on a list of EntrySeqIDs
    filterTasksFromApp(entrySeqIDs) {
        let tb = this;
        // Save the list of tasks
        tb.tbm.filterTasksFromApp(entrySeqIDs);
    };

    // Function to clear all filters and show all tasks
    clearFilterFromApp() {
        let tb = this;
        tb.tbm.clearFilterFromApp();
    };

    setJsonCookie(name, jsonObject, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        var jsonString = JSON.stringify(jsonObject);
        var encodedJsonString = encodeURIComponent(jsonString);
        document.cookie = name + "=" + encodedJsonString + expires + "; path=/";
    }

    getJsonCookie(name, renewDays) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                var encodedJsonString = c.substring(nameEQ.length, c.length);
                var jsonString = decodeURIComponent(encodedJsonString);
                var jsonObject = JSON.parse(jsonString);

                // Renew the cookie's expiration date
                if (renewDays) {
                    this.setJsonCookie(name, jsonObject, renewDays);
                }

                return jsonObject;
            }
        }
        return null;
    }

    getCookieSize(name) {
        const jsonCookie = this.getJsonCookie(name);
        if (jsonCookie) {
            const jsonString = JSON.stringify(jsonCookie);
            const encodedJsonString = encodeURIComponent(jsonString);
            return encodedJsonString.length;
        }
        return 0;
    }

    saveUserSettings() {
        const tb = this;
        const settings = {
            mapLayer: tb.tbm.getCurrentMapLayer(),
            showAirports: tb.tbm.isLayerVisible('Airports'),
            showRailways: tb.tbm.isLayerVisible('Railways'),
            windCompass: tb.tbm.isLayerVisible('Wind Compass')
        };
        tb.setJsonCookie('userSettingsInApp', settings, 300);
    }

    loadUserSettings() {
        const tb = this;
        const settings = tb.getJsonCookie('userSettingsInApp', 300);
        if (settings) {
            tb.tbm.setMapLayer(settings.mapLayer);
            tb.tbm.setLayerVisibility('Airports', settings.showAirports);
            tb.tbm.setLayerVisibility('Railways', settings.showRailways);
            tb.tbm.setLayerVisibility('Wind Compass', settings.windCompass);
        }
    }
} // end class IntegratedTB
