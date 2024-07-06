// ******************************************************************************
// ***********   B21_MSFS_PLN class          **************************************
// ******************************************************************************

// Constructs a .PLN file for output

class B21_MSFS_PLN {

    constructor(task) {

        this.task = task;
        this.departure = null;
        this.departure_updated = false; // will set to true if/when the departure runway has been set in the first waypoint
        this.destination = null;
    }

    load_pln_str(pln_str) {
        console.log("load_pln_str");
        const parser = new DOMParser();
        const dom = parser.parseFromString(pln_str, "application/xml");
        let flight_plan_el = dom.getElementsByTagName("FlightPlan.FlightPlan")[0];
        // ***************
        // Title
        try {
            let title = flight_plan_el.getElementsByTagName("Title")[0].childNodes[0].nodeValue;
            if (title != null) {
                this.task.title = title;
            }
        } catch (e) {
            console.log("No title in PLN");
        }
        // ***************
        // Descr
        try {
            let description = flight_plan_el.getElementsByTagName("Descr")[0].childNodes[0].nodeValue;
            if (description != null) {
                this.task.description = description;
            }
        } catch (e) {
            console.log("No description in PLN");
        }
        // ***************************
        // Departure
        this.departure = {};
        this.departure.id = dom.getElementsByTagName("DepartureID")[0].childNodes[0].nodeValue;
        try {
            this.departure.runway = dom.getElementsByTagName("DeparturePosition")[0].childNodes[0].nodeValue;
            //console.log("load_pln_str got departure", this.departure);
        } catch (e) {
            this.departure.runway = null;
            console.log("load_pln_str no DeparturePosition in .PLN file");
        }
        // ***************************
        // Destination
        this.destination = {};
        this.destination.id = dom.getElementsByTagName("DestinationID")[0].childNodes[0].nodeValue;
        // ***************************
        // Waypoints
        let dom_waypoints = dom.getElementsByTagName("ATCWaypoint"); //XMLNodeList
        for (let i = 0; i < dom_waypoints.length; i++) {
            this.add_pln_wp(dom_waypoints[i]);
        }
    }

    // Add a WP from a PLN waypoint entry
    add_pln_wp(dom_wp) {
        //this.index = this.waypoints.length;
        let wp_index = this.task.index == null ? 0 : this.task.index + 1;
        //console.log("B21_MSFS_PLN.add_pln_wp adding pln wp with index", wp_index);
        let wp;
        try {
            // An exception will be generated if this WP should be ignored, e.g. TIMECRUIS
            wp = new B21_WP(this.task.planner);
            // Update this WP with the additional PLN info
            this.update_wp_pln(wp, wp_index, dom_wp);
        } catch (e) {
            console.log("add_pln_wp skipping:", e);
            return;
        }
        // Update task current index
        this.task.index = wp_index;
        //this.waypoints.push(wp);
        //INSERT this wp into waypoints at index
        this.task.waypoints.splice(wp_index, 0, wp);
        //if (wp_index > 0) {
        //    this.task.add_line(this.task.waypoints[wp_index - 1], wp);
        //}
        this.task.decode_wp_name(wp);
    }

    world_position_to_latlngaltm(world_position) {
        // <WorldPosition>N40° 40' 38.62",W77° 37' 36.71",+000813.00</WorldPosition>
        //console.log(`B21_MSFS_PLN.world_position_to_latlngaltm("${world_position}")`);

        let world_pos_elements = world_position.split(","); // lat, lng, alt feet

        let lat_elements = world_pos_elements[0].split(" ");

        let lat = parseInt(lat_elements[0].slice(1)) + parseFloat(lat_elements[1]) / 60 + parseFloat(lat_elements[2]) / 3600;
        lat = lat_elements[0][0] == "N" ? lat : -1 * lat;

        let lng_elements = world_pos_elements[1].split(" ");
        let lng = parseInt(lng_elements[0].slice(1)) + parseFloat(lng_elements[1]) / 60 + parseFloat(lng_elements[2]) / 3600;
        lng = lng_elements[0][0] == "E" ? lng : -1 * lng;

        let alt_m = parseFloat(world_pos_elements[2]) / this.task.planner.M_TO_FEET;

        return { lat: lat, lng: lng, alt_m: alt_m };
    }

    // Update an existing task WP with data contained in a PLN ATCWaypoint
    update_wp_pln(wp, index, dom_wp) {
        let name = dom_wp.getAttribute("id");
        //console.log("New WP from dom:", name);
        if (name == "TIMECRUIS" || name == "TIMECLIMB" || name == "TIMEVERT") {
            // Skip this waypoint, & tell the caller (Task) via an exception
            throw "SKIP_WAYPOINT";
        }
        //console.log("New WP from dom OK:", name);
        // <WorldPosition>N40° 40' 38.62",W77° 37' 36.71",+000813.00</WorldPosition>
        let world_position = dom_wp.getElementsByTagName("WorldPosition")[0].childNodes[0].nodeValue;
        //console.log(`B21_MSFS_PLN.update_wp_pln with "${world_position}"`);

        let latlngaltm = this.world_position_to_latlngaltm(world_position);

        // Set position
        wp.new_point(index, new L.latLng(latlngaltm.lat, latlngaltm.lng));

        // Set WP alt_m
        wp.alt_m = latlngaltm.alt_m;

        // Set WP name
        wp.name = name;

        let icao_codes = dom_wp.getElementsByTagName("ICAOIdent");
        let dom_wp_runways = dom_wp.getElementsByTagName("RunwayNumberFP");
        let dom_wp_rw_designators = dom_wp.getElementsByTagName("RunwayDesignatorFP");

        // Set WP data_icao, icao
        if (icao_codes.length > 0) {
            wp.data_icao = icao_codes[0].childNodes[0].nodeValue;
            wp.icao = wp.data_icao;
            console.log("Set icao to " + wp.icao);
            // Get our MSFS airports data for this icao:
            let airport_info; // = this.task.planner.airports.lookup(wp.icao);
            console.log("PLN load lookup ICAO", wp.icao, airport_info);
            // Add the 'runways' data to the WP, if available
            if (airport_info != null) {
                // Add list of available runways
                if (airport_info['runways'] != null && airport_info["runways"] != "") {
                    let runways_list = airport_info["runways"].split(" ");
                    wp.runways = runways_list;
                }
                // Add actual departure runway if this is the departure airfield, and it's set
                if (this.departure != null && this.departure.id != null && this.departure.id == wp.icao) {
                    wp.runway = this.departure.runway;
                    this.departure_updated = true;
                }
            }
        }

        // Set WP runway
        if (dom_wp_runways.length > 0) {
            let runway_nodes = dom_wp_runways[0].childNodes;
            if (runway_nodes.length > 0) {
                wp.runway = dom_wp_runways[0].childNodes[0].nodeValue;
                if (wp.runway.length == 1) {
                    wp.runway = "0"+wp.runway;
                }
            }
        }

        // Add L / R / C designator
        if (dom_wp_rw_designators.length > 0) {
            let des_nodes = dom_wp_rw_designators[0].childNodes;
            if (des_nodes.length > 0) {
                let des_str = dom_wp_rw_designators[0].childNodes[0].nodeValue;
                console.log("Read PLN got des str "+des_str);
                if (des_str == "LEFT") {
                    wp.runway += "L";
                } else if (des_str = "RIGHT") {
                    wp.runway += "R";
                } else if (des_str = "CENTER") {
                    wp.runway += "C";
                }
            }
        }
    }

    get_title() {
        if (this.task.title != null) {
            return this.task.title;
        }

        if (this.task.name != null) {
            return this.task.name;
        }
        let first_wp = this.task.waypoints[0];
        let last_wp = this.task.waypoints[this.task.waypoints.length - 1];
        let from = first_wp.icao != null ? first_wp.icao : first_wp.get_name();
        let to = last_wp.icao != null ? last_wp.icao : last_wp.get_name();

        return from + " to " + to;
    }

    get_descr() {
        if (this.task.description != null) {
            return this.task.description;
        }

        return this.get_title();
    }

} // end B21_MSFS_CLASS class
