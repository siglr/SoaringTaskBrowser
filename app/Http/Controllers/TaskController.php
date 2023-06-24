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
            'min_time' => 'required',
            'max_time' => 'required',
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

            $zip = new ZipArchive();
            if ($zip->open($dphx_zip) === true) {
                $zip->extractTo($extractPath);
                $zip->close();
        } else {
            echo "Error: File not found, please contact us.";
        }
    

        
        //Steps to achieve the unzip of the dphx
        //First, change to zip file
        //Then unzip.
        //Then when unzipped, open the files in the zip file
        //Get the data and somewhere before this we should store the files.
        
        //All inputs from the form
        $task = new task;
        $task->submitter = $request->input('submitter'); 
        $task->creator = $request->input('creator');
        $task->task_distance = $request->input('task_distance');
        $task->total_distance = $request->input('total_distance');
        $task->min_time = $request->input('min_time');
        $task->max_time = $request->input('max_time');
        
        //Inputs from the DPHX (god help me)

        //Upload to the DB
        $task->save();


    }
} }
