
"use strict"

// B21 geo utility functions e.g. distance between two points

// A point is {lat: lng:} assumed WGS84
// Distances are in meters

class Geo {

    static EARTH_RADIUS = 6366710.0; // Earth mean radius in meters (accurate at mid-latitudes)

    static debug() { return 123; }

    // Earth radius estimate for given latitude https://rechneronline.de/earth-radius/
    // R =  sqrt([ (r1² * cos(B))² + (r2² * sin(B))² ] / [ (r1 * cos(B))² + (r2 * sin(B))² ])
    static get_earth_radius_m(lat) {
        let R1 = 6378.137; // radius at equator KM
        let R2 = 6356.752; // radus at poles KM
        let B = Geo.deg2rad(lat);
        let sin_b = Math.sin(B);
        let cos_b = Math.cos(B);
        let term1 =  Math.pow(Math.pow(R1,2) * cos_b,2)+Math.pow(Math.pow(R2,2)*sin_b,2);
        let term2 = Math.pow(R1*cos_b,2)+Math.pow(R2*sin_b,2);
        return Math.sqrt(term1/term2) * 1000;
    }

    // convert distance meters on earths surface to radians subtended at the centre
    static m2rad(distance) {
        return distance / Geo.EARTH_RADIUS;
    }

    // Return distance in m between positions p1 and p2.
    // lat/lngs in e.g. p1.lat etc
    static get_distance_m(p1, p2) {
        var dLat = Geo.deg2rad(p2.lat - p1.lat);
        var dLong = Geo.deg2rad(p2.lng - p1.lng);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(Geo.deg2rad(p1.lat)) * Math.cos(Geo.deg2rad(p2.lat)) *
                            Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = Geo.get_earth_radius_m((p1.lat+p2.lat)/2) * c;
        return d; // returns the distance in meter
    }

    // Bearing in degrees from point p1 -> p2 (each as {lat: , lng: })
    static get_bearing_deg(p1, p2)
    {
        // Convert p1,p2 degrees -> radians
        var a = { lat: Geo.deg2rad(p1.lat), lng: Geo.deg2rad(p1.lng) };
        var b = { lat: Geo.deg2rad(p2.lat), lng: Geo.deg2rad(p2.lng) };
        var y = Math.sin(b.lng-a.lng) * Math.cos(b.lat);
        var x = Math.cos(a.lat)*Math.sin(b.lat) -
                    Math.sin(a.lat)*Math.cos(b.lat)*Math.cos(b.lng-a.lng);
        return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360; // Converts back to degrees
    }

    // distance_and_bearing(...) returns a new lat/lng a distance and bearing from lat1,lon1.
    // lat, lngs and bearings in degrees, distance in meters
    static get_distance_and_bearing(p, distance, bearing) {
    	const rlat1 = Geo.deg2rad(p.lat);
    	const rlong1 = Geo.deg2rad(p.lng);
    	const rdistance = Geo.m2rad(distance);
    	const rbearing = Geo.deg2rad(bearing);
    	const rlat2 = Math.asin(Math.sin(rlat1)*Math.cos(rdistance)+Math.cos(rlat1)*Math.sin(rdistance)*Math.cos(rbearing));
        let rlong2;
    	if (Math.cos(rlat2)==0) {
            rlong2 = rlong1;      // endpoint a pole
    	}
    	else {
    		rlong2 = ((rlong1+Math.asin(Math.sin(rbearing)*Math.sin(rdistance)/Math.cos(rlat2))+Math.PI) % (2*Math.PI))-Math.PI;
    	}
    	return { "lat": Geo.rad2deg(rlat2), "lng": Geo.rad2deg(rlong2) };
    }

    // Return TRUE if wp_bearing is within +/- sector_size/2 degrees of leg_bearing
    // I.e. if aircraft has waypoint at wp_bearing_deg
    // and next leg from waypoint is in direction leg_bearing
    // and the sector opposite the leg to next waypoint is sector_size degrees wide.
    // E.g. sector_size could be 180 for a start line, or 90 for a turnpoint.
    static in_sector(leg_bearing, wp_bearing, sector_size) {
        let sector_deg = leg_bearing - sector_size / 2;
        if (sector_deg < 0) {
            sector_deg += 360;
        }
        // Delta is the angle +/- 180
        let delta = sector_deg - wp_bearing;
        if (delta < -180) {
            delta += 360;
        } else if (delta > 180) {
            delta -= 360;
        }

        return (delta < 0 && delta > -sector_size);
    }

    // Given an inbound bearing, and an outbound bearing, returns the bisector pointing AWAY from the WP
    static get_bisector_deg(track_in, track_out) {
         let bisector = (track_in + track_out) / 2 + 90;
         let bisector_offset = (bisector > track_in) ? bisector - track_in : track_in - bisector;
         if (bisector_offset > 90 && bisector_offset < 270) {
              bisector += 180;
          }
         if (bisector >= 360) {
             bisector -= 360;
         }
         return bisector;
    }

    // Given two boxes defined by min/max lat/lng values, return true if they overlap
    static box_overlap(box, map_box) {
        if (map_box.min_lat > box.max_lat) {
            return false;
        }
        if (map_box.max_lat < box.min_lat) {
            return false;
        }
        if (map_box.min_lng > box.max_lng) {
            return false;
        }
        if (map_box.max_lng < box.min_lng) {
            return false;
        }
        return true;
    }

    // Return point which is on line p1 -> p2,
    // e.g. if progress = 0.5 the p will be half way between p1 & p2
    static interp_p1_p2(progress, p1, p2) {
        return { lat: p1.lat + (p2.lat-p1.lat)*progress, lng: p1.lng + (p2.lng - p1.lng)*progress };
    }

//*********************************************************************************************
//*************** CONVERSION FUNCTIONS, E.G. meters to nautical miles *************************
//*********************************************************************************************

    // degrees to radians
    static deg2rad(x) {
        return x * Math.PI / 180;
    }

    // radians to degrees
    static rad2deg(x) {
        return x * (180.0 / Math.PI);
    }

    // meters to nautical miles
    static nm(x) {
            return x * 0.000539956803;
    }

    // meters to statute miles
    static miles(x) {
            return x * 0.000621371;
    }

}
