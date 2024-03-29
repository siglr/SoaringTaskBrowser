<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\File;

use App\Models\task;

use ZipArchive;

class TaskController extends Controller
{
    public function view() {
        return view('tasks');
    }

    public function uploadview() {
        if(Auth::check()) {
            return view('taskupload');
        }
    }

    public function uploadTask(Request $request) {
        //Validate the input.
        $credentials = $request->validate([
            'dphx_file' => 'required',
            'submitter' => 'required|min:3',
            'creator' => 'required|min:3',
            'task_distance' => 'required',
            'total_distance' => 'required',
        ]);

        //Store the DPHX
        $dphx_file = $request->file('dphx_file');
        $dphx_name = $dphx_file->getClientOriginalName();
        // $dphx_ext = $dphx_file->getClientOriginalExtension();
        $dphx_name_without_ext = $request->input('dphx_file');

        Storage::disk('public')->putFileAs('dphx',$dphx_file, $dphx_name);

        if(Storage::disk('public')->exists('dphx', $dphx_name)) {
            $dphx_zip = Storage::disk('public')->path('dphx/'.$dphx_name);
            $extractTo = pathinfo($dphx_zip, PATHINFO_FILENAME); // Extract the file name without extension
            $extractPath = Storage::disk('public')->path('dphx/'.$extractTo);
            global $folderName;
            $folderName = $extractTo;

            $zip = new ZipArchive();
            if ($zip->open($dphx_zip) === true) {
                $zip->extractTo($extractPath);
                $zip->close();
        } else {
            echo "Error: File not found, please contact us.";
        }

        //Get the data out of the file
        $dphName = str_replace('_', ' ', $folderName);
        $dphFile = Storage::disk('public')->get('dphx/'. $folderName . '/'. $dphName. ".dph");

        //load the .dph using simplexml
        $xml = simplexml_load_string($dphFile);

        //Getting the data
        
        $title = $xml->Title;
        $simDate = $xml->SimDate;
        $POI = $xml->MainAreaPOI;
        $departure = $xml->DepartureICAO;
        $arrival = $xml->ArrivalICAO;

        $thermals = $xml->SoaringThermals;
        $ridge = $xml->SoaringRidge;


        $durationMin = $xml->DurationMin;
        $durationMax = $xml->DurationMax;

        $glider = $xml->RecommendedGliders;
        $difficulty = $xml->DifficultyRating;

        $ShortDescription = $xml->ShortDescription;
        $LongDescription = $xml->LongDescription;
        
        //Soaringtype (Ugly I know..)
        $soaringtype;
        if ( $ridge & $thermals) {
            $soaringtype = 'Ridge and Thermals';
        } elseif ($ridge) {
            $soaringtype = 'Ridge';
        } elseif ($thermals) {
            $soaringtype = 'Thermals';
        } else {
            $soaringtype = 'invalid entry';
        }

        //Description;
        $desc = $ShortDescription . ' | ' . $LongDescription;
        
        //Inputs from form
        $task = new task;
        $task->submitter = $request->input('submitter'); 
        $task->creator = $request->input('creator');
        $task->task_distance = $request->input('task_distance');
        $task->total_distance = $request->input('total_distance');
        
        //Inputs from the DPHX
        $task->title = $title;
        $task->date = $simDate;
        $task->poi = $POI;
        $task->departure = $departure;
        $task->arrival = $arrival;
        $task->type = $soaringtype;
        $task->min_time = $durationMin;
        $task->max_time = $durationMax;
        $task->glider_type = $glider;
        $task->difficulty = $difficulty;
        $task->desc = $desc;

        $task->wpr_name = $dphName . '.WPR';
        $task->dphx_name = $dphx_name;
        $task->pln_name = $dphName . '.pln';

        //Upload to the DB
        $task->save();


    }
} }
