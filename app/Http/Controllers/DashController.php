<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashController extends Controller
{
    public function view() {
        if(Auth::check()) {
            return view('dashboard');
        }
       
    }
}
