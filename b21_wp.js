class B21_WP {
    constructor(planner) {
        let wp = this;
        wp.planner = planner; // reference to B21TaskPlanner instance
        wp.task = planner.b21_task;
        wp.DEFAULT_RADIUS_M = 500;
        wp.DEFAULT_START_RADIUS_M = 2500;
        wp.DEFAULT_FINISH_RADIUS_M = 2000;
        wp.DEFAULT_AAT_RADIUS_M = 4000;
    }

    new_point(index, position) {
        let wp = this;

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

    reset() {
        let wp = this;
    }

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
            draggable: false, // ** Waypoints are all fixed on WeSimGlide.org **
            autoPan: true,
            bubblingMouseEvents: false
        });

        marker.bindPopup('', {
            offset: [20, 10],
            className: "wp_popup",
            autoClose: false,
            bubblingMouseEvents: false
        });

        marker.on('click', function () {
            wp.wp_click(wp);
        });

        wp.task.map_elements.addLayer(marker);

        return marker;
    }

    wp_click(wp) {
        wp.task.select_waypoint(wp.index);
    }

    get_icon(wp) {
        let icon_str = (wp.get_name()).replaceAll(" ", "&nbsp;");
        let class_name = (wp.task.index == wp.index) ? "wp_icon_html_current" : "wp_icon_html";
        let icon_html = '<div class="' + class_name + '">' + icon_str + "</div>";
        let wp_icon = L.divIcon({
            className: "wp_icon",
            iconSize: [5, 5],
            iconAnchor: [0, 0],
            html: icon_html
        });

        return wp_icon;
    }

    is_task_start() {
        let wp = this;
        return wp.index == wp.task.start_index;
    }

    is_task_finish() {
        let wp = this;
        return wp.index == wp.task.finish_index;
    }

    get_name() {
        let wp = this;
        if (wp.name == null) {
            if (wp.index == 0) {
                return "Origin";
            } else {
                return "WP " + (wp.index - 1);
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
        if (icao == "") {
            wp.icao = null;
        } else {
            wp.icao = icao;
            if (wp.name == null) {
                wp.name = wp.icao;
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
        if (prev_wp != null) {
            wp.update_leg_distance(prev_wp);
            wp.update_leg_bearing(prev_wp);
        }
    }

    update_leg_distance(prev_wp) {
        let wp = this;
        wp.leg_distance_m = Geo.get_distance_m(wp.position, prev_wp.position);
    }

    update_leg_bearing(prev_wp) {
        let wp = this;
        wp.leg_bearing_deg = Geo.get_bearing_deg(prev_wp.position, wp.position);
    }

    update_icon(wp) {
        let icon = wp.get_icon(wp);
        wp.marker.setIcon(icon);
    }

    display_popup() {
        let wp = this;

        // Ensure the marker and position are valid before displaying the popup
        if (wp.marker && wp.position && wp.position.lat !== undefined && wp.position.lng !== undefined) {
            let content = wp.generate_popup_content();
            wp.marker.bindPopup(content, {
                offset: [20, 10],
                className: "wp_popup",
                autoClose: false,
                bubblingMouseEvents: false
            }).openPopup();
            wp.task.current_popup = wp.marker.getPopup(); // Store reference to the current popup
        } else {
            console.warn("Waypoint marker or position is not defined. Popup cannot be displayed.");
        }
    }

    generate_popup_content() {
        let wp = this;

        let firstLine = wp.getFirstLine();
        let secondLine = wp.getSecondLine();
        let thirdLine = wp.getThirdLine();

        return `<div>${firstLine}</div><div>${secondLine}</div><div>${thirdLine}</div>`;
    }

    getFirstLine() {
        let wp = this;
        let prefix = '';
        if (wp.index === 0) {
            prefix = '(D) ';
        } else if (wp.index === wp.task.start_index) {
            prefix = '(S) ';
        } else if (wp.index === wp.task.finish_index) {
            prefix = '(F) ';
        } else if (wp.index === wp.task.waypoints.length - 1) {
            prefix = '(A) ';
        }
        return `<strong>${prefix}${wp.name || `Waypoint ${wp.index + 1}`}</strong>`;
    }

    getSecondLine() {
        let wp = this;
        let secondLine = '';
        if (wp.index === 0 || wp.index === wp.task.waypoints.length - 1) {
            secondLine = `${wp.icao || 'N/A'}${wp.runway ? ' Rwy ' + wp.runway : ''}`;
            if (wp.leg_distance_m) {
                secondLine += ` Dist: ${wp.planner.tb.userSettings.distance === 'metric' ? (wp.leg_distance_m / 1000).toFixed(1) + ' km' : (wp.leg_distance_m * 0.000621371).toFixed(1) + ' mi'}`;
            }
        } else {
            if (wp.isAAT()) {
                secondLine += 'AAT - ';
            }
            if (wp.radius_m) {
                if (wp.planner.tb.userSettings.distance === 'metric') {
                    secondLine += wp.radius_m >= 5000 ? `Radius: ${(wp.radius_m / 1000).toFixed(1)} km ` : `Radius: ${Math.round(wp.radius_m)} m `;
                } else {
                    const radiusFeet = wp.radius_m * 3.28084;
                    secondLine += radiusFeet >= 5280 ? `Radius: ${(radiusFeet / 5280).toFixed(1)} mi ` : `Radius: ${Math.round(radiusFeet)}' `;
                }
            }
            if (wp.min_alt_m) {
                secondLine += wp.planner.tb.userSettings.altitude === 'imperial' ? `MIN: ${Math.round(wp.min_alt_m * 3.28084)}' ` : `MIN: ${Math.round(wp.min_alt_m)} m `;
            }
            if (wp.max_alt_m) {
                secondLine += wp.planner.tb.userSettings.altitude === 'imperial' ? `MAX: ${Math.round(wp.max_alt_m * 3.28084)}' ` : `MAX: ${Math.round(wp.max_alt_m)} m `;
            }
            if (wp.leg_distance_m) {
                secondLine += wp.planner.tb.userSettings.distance === 'metric' ? ` Dist: ${(wp.leg_distance_m / 1000).toFixed(1)} km` : ` Dist: ${(wp.leg_distance_m * 0.000621371).toFixed(1)} mi`;
            }
        }
        return secondLine;
    }

    getThirdLine() {
        let wp = this;
        return wp.planner.tb.userSettings.altitude === 'imperial'
            ? `Lat: ${wp.position.lat.toFixed(6)} Long: ${wp.position.lng.toFixed(6)} Elev: ${Math.round(wp.alt_m * 3.28084)}'`
            : `Lat: ${wp.position.lat.toFixed(6)} Long: ${wp.position.lng.toFixed(6)} Elev: ${Math.round(wp.alt_m)} m`;
    }

    is_start(p1, p2, leg_bearing_deg) {
        let wp = this;

        if (wp.max_alt_m != null && p1.alt_m > wp.max_alt_m) {
            return false;
        }
        if (wp.min_alt_m != null && p1.alt_m < wp.min_alt_m) {
            return false;
        }

        let radius_m = wp.radius_m == null ? wp.DEFAULT_START_RADIUS_M : wp.radius_m;
        let p1_distance_m = Geo.get_distance_m(p1, wp.position);
        if (p1_distance_m > radius_m) {
            return false;
        }
        let wp_bearing_deg = Geo.get_bearing_deg(p1, wp.position);
        let in_sector = Geo.in_sector(leg_bearing_deg, wp_bearing_deg, 180);
        if (!in_sector) {
            return false;
        }

        let reverse_bearing_deg = (leg_bearing_deg + 180) % 360;
        wp_bearing_deg = Geo.get_bearing_deg(p2, wp.position);
        let over_start_line = Geo.in_sector(reverse_bearing_deg, wp_bearing_deg, 180);
        return over_start_line;
    }

    is_finish(p1, p2) {
        let wp = this;

        let wp_bearing_deg = Geo.get_bearing_deg(p1, wp.position);
        let before_finish_line = Geo.in_sector(wp.leg_bearing_deg, wp_bearing_deg, 180);
        if (!before_finish_line) {
            return false;
        }

        if (wp.max_alt_m != null && p2.alt_m > wp.max_alt_m) {
            return false;
        }
        if (wp.min_alt_m != null && p2.alt_m < wp.min_alt_m) {
            return false;
        }

        let radius_m = wp.radius_m == null ? wp.DEFAULT_FINISH_RADIUS_M : wp.radius_m;
        let distance_m = Geo.get_distance_m(p2, wp.position);
        if (distance_m > radius_m) {
            return false;
        }

        let reverse_bearing_deg = (wp.leg_bearing_deg + 180) % 360;
        wp_bearing_deg = Geo.get_bearing_deg(p2, wp.position);
        let p2_in_sector = Geo.in_sector(reverse_bearing_deg, wp_bearing_deg, 180);
        return p2_in_sector;
    }

    is_wp(p1, p2) {
        let wp = this;
        if (!wp.in_sector(p1) && wp.in_sector(p2)) {
            return true;
        }
        return false;
    }

    is_wp_exit(p1, p2) {
        let wp = this;
        if (wp.in_sector(p1) && !wp.in_sector(p2)) {
            return true;
        }
        return false;
    }

    toString() {
        let wp = this;
        return wp.name;
    }
}
