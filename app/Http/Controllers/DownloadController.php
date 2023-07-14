<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class DownloadController extends Controller
{
    public function dphx($id) {
        //Find the name of the dphx
        $dphx = DB::table('tasks')->where('id', $id)->value('dphx_name');
        $dphxPath = 'dphx/'. $dphx;
        //Downloads it if it exists.
        if(Storage::disk('public')->exists($dphxPath)) {
            return Storage::disk('public')->download($dphxPath);
        } else {
            echo "Error 404: Requested file not found on server.";
        }
        
    }

    public function pln($id) {
        //Find the name of the pln
        $dphx = DB::table('tasks')->where('id', $id)->value('dphx_name');
        $pln = DB::table('tasks')->where('id', $id)->value('pln_name');
        $plnPath = 'dphx/'. substr_replace($dphx, "", -5). '/'. $pln;
        echo $plnPath;
        //Downloads it if it exists.
        if(Storage::disk('public')->exists($plnPath)) {
            return Storage::disk('public')->download($plnPath);
        } else {
            echo "Error 404: Requested file not found on server.";
        }
    }

    public function wpr($id) {
        //Find the name of the pln
        $dphx = DB::table('tasks')->where('id', $id)->value('dphx_name');
        $wpr = DB::table('tasks')->where('id', $id)->value('wpr_name');
        $wprPath = 'dphx/'. substr_replace($dphx, "", -5). '/'. $wpr;
        //Downloads it if it exists.
        if(Storage::disk('public')->exists($wprPath)) {
            return Storage::disk('public')->download($wprPath);
        } else {
            echo "Error 404: Requested file not found on server.";
        }
    }

    public function tsk($id) {
        //Find the name of the tsk
        $dphx = DB::table('tasks')->where('id', $id)->value('dphx_name');
        $tsk = DB::table('tasks')->where('id', $id)->value('tsk_name');
        $tskPath = 'dphx/'. substr_replace($dphx, "", -5). '/'. $tsk;
        echo $tskPath;
        //Downloads it if it exists.
        if(Storage::disk('public')->exists($tskPath)) {
            return Storage::disk('public')->download($tskPath);
        } else {
            echo "Error 404: Requested file not found on server.";
        }
    }
    
}
