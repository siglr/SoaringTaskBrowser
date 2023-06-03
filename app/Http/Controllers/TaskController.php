<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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

        // //Validates the DPHX (Broken for now)
        // Validator::validate($request, [
        //     'dphx_file' => [ 
        //         'required',
        //         File::types(['dphx'])
        //     ],
        // ]);

        //Save the DPHX
        $dphx_file = $request->file('dphx_file');
        $path = $dphx_file->storeAs('public', $dphx_file->GetClientOriginalName());

        //Extract data from the DPHX
        $dphx = new zipArchive;
        $dphx->open(public_path('storage/' .  basename($path)));

        $wprFilePath = $extractPath . '/'.basename($path).'.wpr';
        $plnFilePath = $extractPath . '/'.basename($path).'.pln';
        $dphFilePath = $extractPath . '/'.basename($path).'.dph';
        $tskFilePath = $extractPath . '/'.basename($path).'.tsk';
        
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
}
