<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
}
