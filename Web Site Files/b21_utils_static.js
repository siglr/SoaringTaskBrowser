
"use strict"

class B21_Utils {

    static clear_div(d) {
        while (d.firstChild) {
            d.removeChild(d.lastChild);
        }
    }

    static hh_mm_ss_from_iso(time_iso) {
        // "2023-11-22T19:04:28.000Z"
        let pos_t = time_iso.indexOf('T');
        return time_iso.slice(pos_t + 1, pos_t + 9);
        //return (new Date(time_iso)).toTimeString().split(' ')[0];
    }

    // convert seconds to H:MM:SS where H is variable number of digits
    static h_mm_ss_from_ts_delta(delta_s) {
        let s = Math.round(delta_s);
        let hours = Math.floor(s / 3600);
        let mins = Math.floor((s - hours * 3600) / 60);
        let secs = Math.floor(s % 60);

        let mm = ("0"+mins).slice(-2)+":";

        let ss = ("0"+secs).slice(-2);

        return hours+":"+mm+ss;
    }

    // convert seconds to HH:MM:SS where HH optional, MM can be single digit
    static h_m_ss_from_ts_delta(delta_s) {
        let s = Math.round(delta_s);
        let hours = Math.floor(s / 3600);
        let mins = Math.floor((s - hours * 3600) / 60);
        let secs = Math.floor(s % 60);

        let hh = hours==0 ? "" : hours+":";

        let mm = ("0"+mins).slice(-2)+":";

        if (hh=="" && mm.startsWith("0")) {
            mm = mm.slice(1);
        }

        let ss = ("0"+secs).slice(-2);

        return hh+mm+ss;
    }

    // convert seconds to HH:MM:SS where HH is optional, MM minimum 2 digits
    static hh_mm_ss_from_ts_delta(delta_s) {
        let s = Math.round(delta_s);
        let hours = Math.floor(s / 3600);
        let mins = Math.floor((s - hours * 3600) / 60);
        let secs = Math.floor(s % 60);

        let hh = "";
        if (hours >= 10) {
            hh = ""+hours+":";
        } else if (hours > 0) {
            hh = "0"+hours+":";
        }

        let mm = ("0"+mins).slice(-2)+":";

        let ss = ("0"+secs).slice(-2);

        return hh+mm+ss;
    }

    // convert seconds to HH:MM
    static hh_mm_from_ts_delta(delta_s) {
        // Round to nearest minute
        let s = Math.round(delta_s / 60) * 60;
        if (delta_s == null || isNaN(s)) {
            return null;
        }
        let hh_mm_ss = B21_Utils.h_mm_ss_from_ts_delta(s);
        return ("0"+hh_mm_ss.slice(0,-3)).slice(-5);
    }

    // convert seconds timestamp ts as "hh:mm:ss"
    static hh_mm_ss_from_ts(ts) {
        let d = new Date(ts * 1000);
        return B21_Utils.hh_mm_ss_from_datetime(d);
    }

    // convert JS datetime to "hh:mm:ss"
    static hh_mm_ss_from_datetime(d) {
        let hh = ('0'+d.getUTCHours()).slice(-2);
        let mm = ('0'+d.getUTCMinutes()).slice(-2);
        let ss = ('0'+d.getUTCSeconds()).slice(-2);
        return hh+":"+mm+":"+ss;
    }

    // convert hh:mm to seconds, hh optional
    static hh_mm_to_time_s(str) {
        return B21_Utils.hh_mm_ss_to_time_s(str+":00");
    }

    // convert hh:mm:ss to seconds, hh & mm optional
    static hh_mm_ss_to_time_s(str) {
        let time_parts = str.split(":");
        try {
            let s = parseInt(time_parts[time_parts.length-1]);
            let m = 0;
            let h = 0;
            if (time_parts.length > 1) {
                m = parseInt(time_parts[time_parts.length-2]);
            }
            if (time_parts.length > 2) {
                h = parseInt(time_parts[time_parts.length-3]);
            }
            let time_s = s + 60*m + 3600*h;
            if (isNaN(time_s)) {
                return null;
            }
            return time_s;
        } catch(e) {
            console.warn(e);
            return null;
        }
    }

    // Convert hhmmss into time-of-day in seconds
    static hhmmss_to_time_s(str) {
        return parseInt(str.substring(0,2)) * 3600 + parseInt(str.substring(2,4)) * 60 + parseInt(str.substring(4,6));
    }

    static file_suffix(filename) {
        return filename.toLowerCase().split('.').pop();
    }
}
