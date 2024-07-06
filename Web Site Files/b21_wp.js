"use strict"
// ******************************************************************************
// ***********   WP class (waypoint)       **************************************
// ******************************************************************************

class B21_WP {

    // Waypoint may be created by a click on the map:
    //          new WP(planner, index, position)
    // or as a result of loading an MSFS flightplan:
    //          new WP(planner,index,null,WP_dom_object)
    //

    // get_icon(WP)
    // get_name()
    // get_icao()
    // get_runway()
    // get_radius()
    // get_leg_bearing()

    constructor(planner) {
        let wp = this;
        wp.planner = planner; // reference to B21TaskPlanner instance

        wp.DEFAULT_RADIUS_M = 500;
        wp.DEFAULT_START_RADIUS_M = 2500;
        wp.DEFAULT_FINISH_RADIUS_M = 2000;
        wp.DEFAULT_AAT_RADIUS_M = 4000;
    }

    new_point(index, position) {
        let wp = this;
        //console.log("new WP", index, position, name);

        wp.name = null;
        wp.position = position;
        wp.icao = null;
        wp.data_icao = null; // original ICAO code from source data (may not use in output PLN if not first/last waypoint)
        wp.runway = null; // Selected runway
        wp.runways = null; // List of available runways
        wp.alt_m = 0;
        wp.alt_m_updated = false; // true is elevation has been updated
        wp.radius_m = null;
        wp.max_alt_m = null;
        wp.min_alt_m = null;
        // turnpoint sector (Leaflet circle)
        wp.is_aat = false; // is this WP the center of an AREA ?

        // Values from task
        // Note each 'leg_' value is TO this waypoint
        wp.index = index;
        wp.aat_line = null; // holds [L.polyline, L.polyline] used in task.js to draw AAT lines for tracklog on map
        wp.leg_bearing_deg = null; // Bearing from previous WP to this WP
        wp.leg_distance_m = null; // Distance (meters) from previous WP to this WP
        wp.marker = wp.create_marker();
    }

    // isAAT() returns true if this is an AAT waypoint, or can be SET by passing true/false
    isAAT(set_value) {
        let wp = this;
        if (set_value != null) {
            wp.is_aat = set_value;
        }
        return wp.is_aat;
    }

    create_marker() {
        let wp = this;

        let marker = L.marker(wp.position, {
            icon: wp.get_icon(wp),
            draggable: true,
            autoPan: true,
            bubblingMouseEvents: false
        });
        marker.on("dragstart", function(e) {
            wp.planner.map.closePopup();
        });
        marker.on("drag", function(e) {
            let marker = e.target;
            wp.position = marker.getLatLng();
            wp.planner.b21_task.update_waypoints();
            wp.planner.b21_task.draw();
            wp.planner.b21_task.display_task_info();
        });
        marker.on("dragend", function(e) {
            wp.planner.b21_task.set_current_wp(wp.index);
            console.log("WP dragend");
            let marker = e.target;
            wp.planner.request_alt_m(wp, wp.position, wp.request_alt_m_ok, wp.request_alt_m_fail);
        });

        // POPUP
        //console.log("creating WP popup",wp.get_name());
        var popup = L.popup({
                offset: [20, 10],
                className: "wp_popup",
                autoClose: false,
                bubblingMouseEvents: false
            })
            .setContent("no WP content yet");

        marker.bindPopup(popup);

        marker.on('popupopen', () => {
            console.log(`wp.marker event on popupopen ${wp.get_name()}`);
            wp.planner.b21_task.set_current_wp(wp.index);
        });

        marker.addTo(wp.planner.map);

        return marker;
    }

    set_edit_mode(wp) {
        wp.marker.dragging.enable();
    }

    reset_edit_mode(wp) {
        //console.log("WP.reset_edit_mode "+wp.name);
        wp.marker.dragging.disable();
    }

    wp_click(wp, e) {
        //console.log("wp_click");
        wp.planner.b21_task.set_current_wp(wp.index);
    }

    // The ap "icon" is the permanently displayed div containing the name
    get_icon(wp) {
        //let icon_str = '<div onclick="b21_task_planner.b21_task.set_current_wp(0);">';
        //let icon_str = ((1 + wp.index) + "." + wp.get_name()).replaceAll(" ", "&nbsp;");
        let icon_str = (wp.get_name()).replaceAll(" ", "&nbsp;");
        //icon_str += "</div>";
        let class_name = (wp.planner.b21_task.index == wp.index) ? "wp_icon_html_current" : "wp_icon_html";
        let icon_html = '<div class="' + class_name + '">' + icon_str + "</div>";
        let wp_icon = L.divIcon({
            className: "wp_icon",
            iconSize: [5, 5],
            iconAnchor: [0, 0],
            html: icon_html
        });

        return wp_icon;
    }

    // remove the AAT line drawn to this waypoint
    remove_aat_line(wp) {
        if (wp.aat_line != null) {
            for (let i = 0; i < wp.aat_line.length; i++) {
                wp.aat_line[i].remove(wp.planner.map);
            }
            wp.aat_line = null;
        }
    }

    request_alt_m_ok(wp, position, alt_m) {
        console.log("wp.request_alt_m_ok elevation(m):", position, alt_m);
        wp.alt_m = alt_m;
        wp.alt_m_updated = true;
        // If this is the current waypoint, popup the wp menu
        if (wp.index == wp.planner.b21_task.index) {
            wp.display_menu(wp);
        }
        wp.planner.b21_task.display_task_info();
    }

    request_alt_m_fail(wp, position, error_str, error) {
        console.log("WP alt_m fetch error", error_str, error);
    }

    is_task_start() {
        let wp = this;
        return wp.index == wp.planner.b21_task.start_index;
    }

    is_task_finish() {
        let wp = this;
        return wp.index == wp.planner.b21_task.finish_index;
    }

    get_name() {
        let wp = this;
        if (wp.name == null) {
            if (wp.index == 0) {
                return "Origin";
            } else {
                return "WP " + (wp.index-1);
            }
        }
        return wp.name;
    }

    set_name(name) {
        let wp = this;
        wp.name = name;
        wp.update_icon(wp);
    }

    get_icao() {
        let wp = this;
        return wp.icao == null ? "" : wp.icao;
    }

    set_icao(icao) {
        let wp = this;
        console.log("wp.set_icao", icao);
        if (icao == "") {
            console.log("setting icao to null");
            wp.icao = null;
        } else {
            console.log("setting icao to '" + icao + "'");
            wp.icao = icao;
            if (wp.name == null) {
                wp.name = wp.icao;
                document.getElementById("wp_name").value = wp.icao;
            }
        }
        wp.update_icon(wp);
    }

    get_runway() {
        let wp = this;
        return wp.runway == null ? "" : wp.runway;
    }

    set_runway(runway) {
        let wp = this;
        wp.runway = runway;
    }

    set_radius(radius_m) {
        let wp = this;
        wp.radius_m = radius_m;
    }

    // return Wp radius in meters
    get_radius() {
        let wp = this;
        if (wp.radius_m != null) return wp.radius_m;
        if (wp.is_task_start()) return wp.DEFAULT_START_RADIUS_M;
        if (wp.is_task_finish()) return wp.DEFAULT_FINISH_RADIUS_M;
        return wp.DEFAULT_RADIUS_M;
    }

    get_leg_bearing() {
        let wp = this;
        if (wp.leg_bearing_deg == null) {
            return "";
        }
        return wp.leg_bearing_deg.toFixed(0);
    }

    update(prev_wp = null) {
        let wp = this;
        //console.log("update",wp.index);
        if (prev_wp != null) {
            wp.update_leg_distance(prev_wp);
            wp.update_leg_bearing(prev_wp);
        }
    }

    // Add .leg_distance_m property for distance (meters) from wp to this waypoint
    // Called when task is loaded
    update_leg_distance(prev_wp) {
        let wp = this;
        wp.leg_distance_m = Geo.get_distance_m(wp.position, prev_wp.position);
        //console.log("update_leg_distance", wp.index, wp.leg_distance_m);
    }

    // Add .bearing property for INBOUND bearing FROM wp TO this waypoint
    // Called when task is loaded
    update_leg_bearing(prev_wp) {
        let wp = this;
        wp.leg_bearing_deg = Geo.get_bearing_deg(prev_wp.position, wp.position);
    }

    update_icon(wp) {
        //console.log("update_icon for wp",wp.index);
        let icon = wp.get_icon(wp);
        wp.marker.setIcon(icon);
    }

    display_menu(wp) {
        console.log(`wp.display_menu() ${wp.get_name()}`);
        // NAME
        let form_str = 'Name: <input id="wp_name" class="wp_name" onchange="b21_task_planner.change_wp_name(this.value)" value="' + wp.get_name() +
            '"</input>';

        // ICAO
        form_str += '<br/>ICAO: <input class="wp_icao" onchange="b21_task_planner.change_wp_icao(this.value)" value="' + wp.get_icao() +
            '"</input> ';

        // RUNWAY
        form_str +=
            ' Runway: <input id="wp_runway" class="wp_runway" onchange="b21_task_planner.change_wp_runway(this.value)" value="' +
            wp.get_runway() + '"</input> ';
        if (wp.runways != null) {
            form_str += '<select class="wp_runway_select" onclick="b21_task_planner.select_wp_runway(this.value)" value="">';
            for (let i = 0; i < wp.runways.length; i++) {
                form_str += '<option>' + wp.runways[i] + '</option>';
            }
            form_str += '<option></option>'; // Add 'blank' option for no runway selected
            form_str += '</select>';
        }

        // ELEVATION
        let alt_str = wp.alt_m.toFixed(0);
        let alt_units_str = "m.";
        if (wp.planner.settings.altitude_units == "feet") {
            alt_str = (wp.alt_m * wp.planner.M_TO_FEET).toFixed(0);
            alt_units_str = "feet.";
        }

        form_str += '<br/>Elevation: <input class="wp_alt" onchange="b21_task_planner.change_wp_alt(this.value)" value="' +
            alt_str + '"</input> ' + alt_units_str;

        // settings.soaring_task == true . It's a placeholder in case we want planner for non-soaring.
        if (wp.index != 0) {
            // AAT checkbox
            form_str += '<div class="wp_aat">AAT: <input onclick="b21_task_planner.click_wp_aat(event)" type="checkbox"' + (wp.isAAT() ? " checked" :
                "") + '/></div> ';

            // START checkbox
            let start = wp.index == wp.planner.b21_task.start_index;
            form_str += '<br/><div class="wp_start">Start: <input onclick="b21_task_planner.click_wp_start(event)" type="checkbox"' + (start ? " checked" :
                "") + '/></div> ';

            // FINISH checkbox
            let finish = wp.index == wp.planner.b21_task.finish_index;
            form_str += '<div class="wp_finish">Finish: <input  onclick="b21_task_planner.click_wp_finish(event)" type="checkbox"' + (finish ? " checked" :
                "") + '/></div>';

            // RADIUS
            let radius_units_str = "m";
            if (wp.planner.settings.wp_radius_units == "feet") {
                radius_units_str = "feet";
            }
            let radius_str = "";
            if (wp.radius_m != null) {
                if (wp.planner.settings.wp_radius_units == "m") {
                    radius_str = wp.radius_m.toFixed(0);
                } else {
                    radius_str = (wp.radius_m * wp.planner.M_TO_FEET).toFixed(0);
                }
            }
            form_str += ' Radius: <input class="wp_radius" onchange="b21_task_planner.change_wp_radius(this.value)" value="' +
                radius_str + '"</input> ' + radius_units_str;

            // MAX ALT LIMIT
            let max_alt_str = "";
            if (wp.max_alt_m != null) {
                if (wp.planner.settings.altitude_units == "m") {
                    max_alt_str = wp.max_alt_m.toFixed(0);
                } else {
                    max_alt_str = (wp.max_alt_m * wp.planner.M_TO_FEET).toFixed(0);
                }
            }
            form_str += '<br/>Max Alt: <input class="wp_alt" onchange="b21_task_planner.change_wp_max_alt(this.value)" value="' +
                max_alt_str + '"</input> ';

            // MIN ALT LIMIT
            let min_alt_str = "";
            if (wp.min_alt_m != null) {
                if (wp.planner.settings.altitude_units == "m") {
                    min_alt_str = wp.min_alt_m.toFixed(0);
                } else {
                    min_alt_str = (wp.min_alt_m * wp.planner.M_TO_FEET).toFixed(0);
                }
            }
            form_str += ' Min Alt: <input class="wp_alt" onchange="b21_task_planner.change_wp_min_alt(this.value)" value="' +
                min_alt_str + '"</input> ' + alt_units_str;
        }

        // MENU items
        form_str += '<div class="wp_menu">';
        form_str += wp.planner.menuitem("Append to task", "duplicate_wp_to_task");
        form_str += wp.planner.menuitem("Update elevation", "update_wp_elevation");
        form_str += wp.planner.menuitem('<img src="https://xp-soaring.github.io/tasks/b21_task_planner/images/delete.png"/>', "remove_wp_from_task");
        form_str += '</div>';

        // POPUP
        wp.marker.getPopup().setContent(form_str);
        console.log("opening popup");
        wp.marker.openPopup();
    }

    // ********************************************
    // Tracklog calculations
    // Points are { lat, lng, alt_m }
    // ********************************************


    // is_start(p1, p2, leg_bearing) returns true if p1->p2 crosses the start line
    is_start(p1, p2, leg_bearing_deg) {
        let wp = this;
        //console.log("WP.is_start()");

        // Check p1 is in start sector
        if (wp.max_alt_m != null && p1.alt_m > wp.max_alt_m) {
            //console.log("WP.is_start() false p1 max_alt_m="+wp.max_alt_m+" vs "+p1.alt_m);
            return false;
        }
        if (wp.min_alt_m != null && p1.alt_m < wp.min_alt_m) {
            //console.log("WP.is_start() false p1 min_alt_m="+wp.min_alt_m+" vs "+p1.alt_m);
            return false;
        }

        let radius_m = wp.radius_m == null ? wp.DEFAULT_START_RADIUS_M : wp.radius_m;
        let p1_distance_m = Geo.get_distance_m(p1, wp.position);
        if (p1_distance_m > radius_m) {
            //console.log("WP.is_start() false radius_m="+radius_m.toFixed(0)+" vs "+distance_m.toFixed(0));
            return false;
        }
        let wp_bearing_deg = Geo.get_bearing_deg(p1, wp.position);
        let in_sector = Geo.in_sector(leg_bearing_deg, wp_bearing_deg, 180); // Check p1 within start sector angles
        if (!in_sector) {
            //console.log("WP.is_start() false p1 at "+wp_bearing_deg.toFixed(0)+" deg not in start sector");
            return false;
        }
        // OK so p1 is in the start sector, now we need to see if p2 is outside i.e. distance>radius or crosses the start line
        // We do this by seeing if p2 is in the 180-degree sector OPPOSITE the start sector
        // First check radius:
        //if (Geo.get_distance_m(p2, wp.position) > radius_m) {
        //    return true;
        //}
        // Inside radius, but have we crossed start line?
        let reverse_bearing_deg = (leg_bearing_deg + 180) % 360;
        wp_bearing_deg = Geo.get_bearing_deg(p2, wp.position);
        let over_start_line = Geo.in_sector(reverse_bearing_deg, wp_bearing_deg, 180);
        if (over_start_line) {
            //console.log("WP.is_start true at " + wp_bearing_deg.toFixed(0));
        } else {
            //console.log("WP.is_start false at "+wp_bearing_deg.toFixed(0));
        }
        return over_start_line;
    }

    is_finish(p1, p2) {
        let wp = this;
        //console.log("wp is_finish");

        // check p1 is before finish sector
        let wp_bearing_deg = Geo.get_bearing_deg(p1, wp.position);
        let before_finish_line = Geo.in_sector(wp.leg_bearing_deg, wp_bearing_deg, 180);
        if (before_finish_line) {
            //console.log("WP.is_finish p1 before_finish_line=true at "+wp_bearing_deg.toFixed(0));
        } else {
            //console.log("WP.is_finish p1 before_finish_line=false at "+wp_bearing_deg.toFixed(0));
            return false;
        }
        // p1 is before finish

        // Check p2 is in finish sector
        if (wp.max_alt_m != null && p2.alt_m > wp.max_alt_m) {
            //console.log("WP.is_finish() false p2 max_alt_m="+wp.max_alt_m+" vs "+p2.alt_m);
            return false;
        }
        if (wp.min_alt_m != null && p2.alt_m < wp.min_alt_m) {
            //console.log("WP.is_finish() false p2 min_alt_m="+wp.min_alt_m+" vs "+p2.alt_m);
            return false;
        }

        let radius_m = wp.radius_m == null ? wp.DEFAULT_FINISH_RADIUS_M : wp.radius_m;
        let distance_m = Geo.get_distance_m(p2, wp.position);
        if (distance_m > radius_m) {
            //console.log("WP.is_finish() false p2 radius_m="+radius_m.toFixed(0)+" vs "+distance_m.toFixed(0));
            return false;
        }

        let reverse_bearing_deg = (wp.leg_bearing_deg + 180) % 360;
        wp_bearing_deg = Geo.get_bearing_deg(p2, wp.position);
        let p2_in_sector = Geo.in_sector(reverse_bearing_deg, wp_bearing_deg, 180); // Check p2 within finish sector angles
        if (!p2_in_sector) {
            //console.log("WP.is_finish() false p2 at "+wp_bearing_deg.toFixed(0)+" deg not in finish sector");
            return false;
        }

        //console.log("WP.is_finish() true");

        return true;
    }

    // Return true if p1 -> p2 ENTERS this wp radius
    is_wp(p1, p2) {
        let wp = this;
        if (!wp.in_sector(p1) && wp.in_sector(p2)) {
            //console.log("wp is_wp() true");
            return true;
        }
        //console.log("wp is_wp() false");
        return false;
    }

    // Return true if p1 -> p2 EXITS this wp radius
    is_wp_exit(p1, p2) {
        let wp = this;
        if (wp.in_sector(p1) && !wp.in_sector(p2)) {
            //console.log("wp is_wp() true");
            return true;
        }
        //console.log("wp is_wp() false");
        return false;
    }

    in_sector(p) {
        let wp = this;
        //console.log("in_wp_sector");
        if (wp.max_alt_m != null && p.alt_m > wp.max_alt_m) {
            //console.log("in_wp_sector false max_alt_m="+wp.max_alt_m+" vs "+p.alt_m);
            return false;
        }
        if (wp.min_alt_m != null && p.alt_m < wp.min_alt_m) {
            //console.log("in_wp_sector false min_alt_m="+wp.min_alt_m+" vs "+p.alt_m);
            return false;
        }
        let radius_m = wp.radius_m == null ? wp.DEFAULT_RADIUS_M : wp.radius_m;
        let distance_m = Geo.get_distance_m(p, wp.position);
        let in_sector = distance_m < radius_m;
        //console.log("in_wp_sector "+in_sector+" radius_m="+radius_m+" vs "+distance_m.toFixed(1));
        return in_sector;
    }

    // ********************************************
    // class toString
    // ********************************************

    toString() {
        let wp = this;
        return wp.name;
    }
} // end WP class
